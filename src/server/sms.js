// Text Radar — SMS utilities and provider adapter.
// Pure helpers (personalize, segments, phone normalization) are exported
// separately so they can be unit-tested without any network access.

import { normalizePhone } from '../shared/parse.js';
export { normalizePhone };

const GSM7 =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM7_EXT = '^{}\\[~]|€';

/** Fill {{tokens}} in a template from a contact record. Unknown tokens become ''. */
export function personalize(template, contact) {
  return String(template ?? '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const k = key.toLowerCase();
    if (k === 'firstname' || k === 'first_name') return contact.firstName || '';
    if (k === 'lastname' || k === 'last_name') return contact.lastName || '';
    if (k === 'name') return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    if (k === 'phone') return contact.phone || '';
    return contact.fields?.[key] ?? contact.fields?.[k] ?? '';
  });
}

/** Count SMS segments the way carriers bill them (GSM-7 vs UCS-2). */
export function segmentInfo(text) {
  const s = String(text ?? '');
  let gsm = true;
  let units = 0;
  for (const ch of s) {
    if (GSM7.includes(ch)) units += 1;
    else if (GSM7_EXT.includes(ch)) units += 2;
    else { gsm = false; break; }
  }
  if (!gsm) {
    const len = [...s].length;
    return { encoding: 'UCS-2', chars: len, segments: len === 0 ? 0 : len <= 70 ? 1 : Math.ceil(len / 67) };
  }
  return { encoding: 'GSM-7', chars: units, segments: units === 0 ? 0 : units <= 160 ? 1 : Math.ceil(units / 153) };
}

/** True when the message body contains an opt-out keyword (inbound STOP handling). */
export function isOptOutMessage(body) {
  const word = String(body ?? '').trim().toUpperCase();
  return ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(word);
}

// ---------------------------------------------------------------------------
// Provider adapter
// ---------------------------------------------------------------------------

/**
 * Send one SMS/MMS. Returns { ok, sid?, error? }.
 * - provider 'twilio': real delivery through the Twilio REST API.
 * - provider 'simulation': no network; realistic latency and a ~2% failure
 *   rate so the UI can be exercised before credentials exist.
 * mediaUrls (absolute URLs) turn the message into an MMS.
 */
export async function sendSms(settings, { to, body, mediaUrls = [] }) {
  if (settings.provider === 'twilio' && settings.accountSid && settings.authToken && settings.fromNumber) {
    return sendViaTwilio(settings, { to, body, mediaUrls });
  }
  return sendViaSimulation({ to, body });
}

async function sendViaTwilio(settings, { to, body, mediaUrls = [] }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(settings.accountSid)}/Messages.json`;
  const auth = Buffer.from(`${settings.accountSid}:${settings.authToken}`).toString('base64');
  const params = new URLSearchParams({ To: to, From: settings.fromNumber, Body: body });
  for (const m of mediaUrls.slice(0, 10)) params.append('MediaUrl', m);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || `HTTP ${res.status}` };
    return { ok: true, sid: data.sid };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Verify Twilio credentials without sending anything: fetches the account
 * record and checks the from-number belongs to it.
 * Returns { ok, account?, fromNumberOk?, error? }.
 */
export async function verifyTwilio(settings) {
  const { accountSid, authToken, fromNumber } = settings;
  if (!accountSid || !authToken) return { ok: false, error: 'Enter your Account SID and auth token first.' };
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  const base = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}`;
  try {
    const res = await fetch(`${base}.json`, { headers });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return { ok: false, error: 'Twilio rejected these credentials (401). Double-check the SID and auth token.' };
    if (!res.ok) return { ok: false, error: data.message || `Twilio returned HTTP ${res.status}.` };

    let fromNumberOk = null;
    if (fromNumber) {
      const numRes = await fetch(`${base}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(fromNumber)}`, { headers });
      const numData = await numRes.json().catch(() => ({}));
      fromNumberOk = numRes.ok ? (numData.incoming_phone_numbers || []).length > 0 : null;
    }
    return { ok: true, account: { name: data.friendly_name, status: data.status, type: data.type }, fromNumberOk };
  } catch (err) {
    return { ok: false, error: `Could not reach Twilio: ${err.message}` };
  }
}

async function sendViaSimulation() {
  await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  if (Math.random() < 0.02) return { ok: false, error: 'Simulated carrier rejection (30007)' };
  return { ok: true, sid: `SIM${Math.random().toString(36).slice(2, 12)}` };
}
