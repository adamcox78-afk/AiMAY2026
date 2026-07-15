// Text Radar — campaign engine.
// A campaign is a message template plus a recipient list. The engine sends
// one personalized message per recipient (never a group MMS), paced by the
// configured messages-per-second rate, updating per-recipient status live.

import { db, save, saveNow, uid } from './store.js';
import { personalize, sendSms, segmentInfo } from './sms.js';

const running = new Set();

/** Resolve a campaign's audience: explicit contacts + members of chosen groups. */
export function resolveRecipients(state, { contactIds = [], groupIds = [] }) {
  const wanted = new Set(contactIds);
  for (const c of state.contacts) {
    if (c.groupIds?.some((g) => groupIds.includes(g))) wanted.add(c.id);
  }
  const seenPhones = new Set();
  const out = [];
  for (const id of wanted) {
    const c = state.contacts.find((x) => x.id === id);
    if (!c || c.optedOut || seenPhones.has(c.phone)) continue;
    seenPhones.add(c.phone);
    out.push(c);
  }
  return out;
}

export function createCampaign({ name, message, contactIds, groupIds, media = [] }) {
  const state = db();
  const recipients = resolveRecipients(state, { contactIds, groupIds });
  if (recipients.length === 0) return { error: 'No eligible recipients (empty selection, or everyone opted out).' };

  const campaign = {
    id: uid('cmp'),
    name: name?.trim() || 'Untitled blast',
    message,
    media: media.slice(0, 10).map((m) => ({ url: m.url, type: m.type, name: m.name })),
    status: 'queued',
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    segmentsPerMessage: segmentInfo(message).segments || 1,
    recipients: recipients.map((c) => ({
      contactId: c.id,
      phone: c.phone,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone,
      status: 'pending', // pending | sending | delivered | failed
      sid: null,
      error: null,
      sentAt: null
    }))
  };
  state.campaigns.unshift(campaign);
  save();
  return { campaign };
}

/** Kick off (or resume) sending for a campaign. Fire-and-forget. */
export function startCampaign(id) {
  const state = db();
  const campaign = state.campaigns.find((c) => c.id === id);
  if (!campaign) return { error: 'Campaign not found.' };
  if (running.has(id)) return { campaign };
  if (campaign.status === 'completed') return { error: 'Campaign already completed.' };

  campaign.status = 'sending';
  campaign.startedAt = campaign.startedAt || new Date().toISOString();
  save();
  running.add(id);
  runCampaign(campaign).finally(() => running.delete(id));
  return { campaign };
}

async function runCampaign(campaign) {
  const state = db();
  const settings = state.settings;
  const rate = Math.min(Math.max(Number(settings.messagesPerSecond) || 5, 1), 100);
  const gapMs = 1000 / rate;

  // Media must be publicly fetchable for real carriers; relative URLs are
  // fine in simulation mode.
  const base = String(settings.publicBaseUrl || '').replace(/\/$/, '');
  const mediaUrls = (campaign.media || []).map((m) => (m.url.startsWith('http') ? m.url : base + m.url));

  for (const r of campaign.recipients) {
    if (campaign.status === 'paused') break;
    if (r.status !== 'pending') continue;

    const contact = state.contacts.find((c) => c.id === r.contactId);
    if (!contact || contact.optedOut) {
      r.status = 'failed';
      r.error = 'Recipient opted out before send.';
      continue;
    }

    let body = personalize(campaign.message, contact);
    if (settings.appendOptOut && settings.optOutText && !body.includes(settings.optOutText)) {
      body = `${body}\n${settings.optOutText}`;
    }

    r.status = 'sending';
    save();
    const result = await sendSms(settings, { to: r.phone, body, mediaUrls });
    if (result.ok) {
      r.status = 'delivered';
      r.sid = result.sid;
      r.sentAt = new Date().toISOString();
    } else {
      r.status = 'failed';
      r.error = result.error;
    }
    save();
    await new Promise((res) => setTimeout(res, gapMs));
  }

  const unsent = campaign.recipients.some((r) => r.status === 'pending');
  campaign.status = unsent ? 'paused' : 'completed';
  if (!unsent) campaign.finishedAt = new Date().toISOString();
  saveNow();
}

export function pauseCampaign(id) {
  const campaign = db().campaigns.find((c) => c.id === id);
  if (!campaign) return { error: 'Campaign not found.' };
  if (campaign.status === 'sending') campaign.status = 'paused';
  save();
  return { campaign };
}

export function campaignStats(state) {
  let sent = 0, delivered = 0, failed = 0;
  for (const c of state.campaigns) {
    for (const r of c.recipients) {
      if (r.status === 'delivered') { sent++; delivered++; }
      else if (r.status === 'failed') { sent++; failed++; }
    }
  }
  return {
    contacts: state.contacts.filter((c) => !c.optedOut).length,
    optedOut: state.contacts.filter((c) => c.optedOut).length,
    campaigns: state.campaigns.length,
    sent,
    delivered,
    failed,
    deliveryRate: sent === 0 ? null : Math.round((delivered / sent) * 1000) / 10
  };
}
