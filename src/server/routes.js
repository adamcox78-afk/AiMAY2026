// Text Radar — REST API.

import { Router } from 'express';
import { db, save, uid } from './store.js';
import { normalizePhone, isOptOutMessage, personalize, segmentInfo } from './sms.js';
import { createCampaign, startCampaign, pauseCampaign, campaignStats, resolveRecipients } from './engine.js';

const api = Router();

// ---- dashboard -------------------------------------------------------------

api.get('/stats', (req, res) => {
  res.json(campaignStats(db()));
});

// ---- contacts ---------------------------------------------------------------

api.get('/contacts', (req, res) => {
  res.json(db().contacts);
});

api.post('/contacts', (req, res) => {
  const { firstName = '', lastName = '', phone, groupIds = [], fields = {} } = req.body || {};
  const normalized = normalizePhone(phone);
  if (!normalized) return res.status(400).json({ error: `Invalid phone number: "${phone ?? ''}"` });
  const state = db();
  const existing = state.contacts.find((c) => c.phone === normalized);
  if (existing) return res.status(409).json({ error: `A contact with ${normalized} already exists.` });
  const contact = {
    id: uid('ct'), firstName: String(firstName).trim(), lastName: String(lastName).trim(),
    phone: normalized, groupIds, fields, optedOut: false, createdAt: new Date().toISOString()
  };
  state.contacts.push(contact);
  save();
  res.status(201).json(contact);
});

// Bulk import: [{firstName,lastName,phone,groupIds?}] — skips invalid/duplicate rows.
api.post('/contacts/import', (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const groupIds = Array.isArray(req.body?.groupIds) ? req.body.groupIds : [];
  const state = db();
  const seen = new Set(state.contacts.map((c) => c.phone));
  let imported = 0, skipped = 0;
  for (const row of rows) {
    const phone = normalizePhone(row.phone);
    if (!phone || seen.has(phone)) { skipped++; continue; }
    seen.add(phone);
    state.contacts.push({
      id: uid('ct'),
      firstName: String(row.firstName || '').trim(),
      lastName: String(row.lastName || '').trim(),
      phone, groupIds: [...groupIds], fields: {}, optedOut: false,
      createdAt: new Date().toISOString()
    });
    imported++;
  }
  save();
  res.json({ imported, skipped });
});

api.patch('/contacts/:id', (req, res) => {
  const state = db();
  const contact = state.contacts.find((c) => c.id === req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found.' });
  const { firstName, lastName, phone, groupIds, optedOut, fields } = req.body || {};
  if (phone !== undefined) {
    const normalized = normalizePhone(phone);
    if (!normalized) return res.status(400).json({ error: `Invalid phone number: "${phone}"` });
    contact.phone = normalized;
  }
  if (firstName !== undefined) contact.firstName = String(firstName).trim();
  if (lastName !== undefined) contact.lastName = String(lastName).trim();
  if (groupIds !== undefined) contact.groupIds = groupIds;
  if (optedOut !== undefined) contact.optedOut = Boolean(optedOut);
  if (fields !== undefined) contact.fields = fields;
  save();
  res.json(contact);
});

api.delete('/contacts/:id', (req, res) => {
  const state = db();
  const before = state.contacts.length;
  state.contacts = state.contacts.filter((c) => c.id !== req.params.id);
  if (state.contacts.length === before) return res.status(404).json({ error: 'Contact not found.' });
  save();
  res.json({ ok: true });
});

// ---- groups ------------------------------------------------------------------

api.get('/groups', (req, res) => {
  const state = db();
  res.json(state.groups.map((g) => ({
    ...g,
    memberCount: state.contacts.filter((c) => c.groupIds?.includes(g.id) && !c.optedOut).length
  })));
});

api.post('/groups', (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Group name is required.' });
  const state = db();
  const group = { id: uid('grp'), name, createdAt: new Date().toISOString() };
  state.groups.push(group);
  save();
  res.status(201).json(group);
});

api.delete('/groups/:id', (req, res) => {
  const state = db();
  state.groups = state.groups.filter((g) => g.id !== req.params.id);
  for (const c of state.contacts) c.groupIds = c.groupIds?.filter((g) => g !== req.params.id) ?? [];
  save();
  res.json({ ok: true });
});

// ---- campaigns ----------------------------------------------------------------

api.get('/campaigns', (req, res) => {
  res.json(db().campaigns);
});

api.get('/campaigns/:id', (req, res) => {
  const campaign = db().campaigns.find((c) => c.id === req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
  res.json(campaign);
});

// Preview: personalized body + segment info for the first few recipients.
api.post('/campaigns/preview', (req, res) => {
  const { message = '', contactIds = [], groupIds = [] } = req.body || {};
  const state = db();
  const recipients = resolveRecipients(state, { contactIds, groupIds });
  const optOut = state.settings.appendOptOut && state.settings.optOutText ? `\n${state.settings.optOutText}` : '';
  const samples = recipients.slice(0, 5).map((c) => {
    const body = personalize(message, c) + optOut;
    return { name: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone, phone: c.phone, body, ...segmentInfo(body) };
  });
  res.json({ recipientCount: recipients.length, samples, segments: segmentInfo(message + optOut) });
});

api.post('/campaigns', (req, res) => {
  const { name, message, contactIds = [], groupIds = [], sendNow = true } = req.body || {};
  if (!String(message || '').trim()) return res.status(400).json({ error: 'Message text is required.' });
  const result = createCampaign({ name, message, contactIds, groupIds });
  if (result.error) return res.status(400).json(result);
  if (sendNow) startCampaign(result.campaign.id);
  res.status(201).json(result.campaign);
});

api.post('/campaigns/:id/start', (req, res) => {
  const result = startCampaign(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result.campaign);
});

api.post('/campaigns/:id/pause', (req, res) => {
  const result = pauseCampaign(req.params.id);
  if (result.error) return res.status(400).json(result);
  res.json(result.campaign);
});

// ---- settings -------------------------------------------------------------------

api.get('/settings', (req, res) => {
  const { authToken, ...rest } = db().settings;
  res.json({ ...rest, hasAuthToken: Boolean(authToken) });
});

api.put('/settings', (req, res) => {
  const state = db();
  const allowed = ['provider', 'accountSid', 'authToken', 'fromNumber', 'messagesPerSecond', 'appendOptOut', 'optOutText'];
  for (const key of allowed) {
    if (req.body?.[key] !== undefined) state.settings[key] = req.body[key];
  }
  save();
  const { authToken, ...rest } = state.settings;
  res.json({ ...rest, hasAuthToken: Boolean(authToken) });
});

// ---- inbound webhook (STOP handling) -----------------------------------------------
// Point your provider's inbound-SMS webhook here to honor opt-outs automatically.

api.post('/webhooks/inbound', (req, res) => {
  const from = normalizePhone(req.body?.From || req.body?.from);
  const body = req.body?.Body ?? req.body?.body ?? '';
  if (from && isOptOutMessage(body)) {
    const contact = db().contacts.find((c) => c.phone === from);
    if (contact) { contact.optedOut = true; save(); }
  }
  res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response/>');
});

export default api;
