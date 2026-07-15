// Text Radar — SMS utilities and provider adapter.
// Pure helpers (personalize, segments, phone normalization) are exported
// separately so they can be unit-tested without any network access.

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

/** Normalize to E.164. Assumes US (+1) for bare 10-digit numbers. Returns null if invalid. */
export function normalizePhone(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    const rest = digits.slice(1).replace(/\D/g, '');
    return rest.length >= 8 && rest.length <= 15 ? `+${rest}` : null;
  }
  const only = digits.replace(/\D/g, '');
  if (only.length === 10) return `+1${only}`;
  if (only.length === 11 && only.startsWith('1')) return `+${only}`;
  return null;
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
 * Send one SMS. Returns { ok, sid?, error? }.
 * - provider 'twilio': real delivery through the Twilio REST API.
 * - provider 'simulation': no network; realistic latency and a ~2% failure
 *   rate so the UI can be exercised before credentials exist.
 */
export async function sendSms(settings, { to, body }) {
  if (settings.provider === 'twilio' && settings.accountSid && settings.authToken && settings.fromNumber) {
    return sendViaTwilio(settings, { to, body });
  }
  return sendViaSimulation({ to, body });
}

async function sendViaTwilio(settings, { to, body }) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(settings.accountSid)}/Messages.json`;
  const auth = Buffer.from(`${settings.accountSid}:${settings.authToken}`).toString('base64');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: to, From: settings.fromNumber, Body: body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || `HTTP ${res.status}` };
    return { ok: true, sid: data.sid };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function sendViaSimulation() {
  await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  if (Math.random() < 0.02) return { ok: false, error: 'Simulated carrier rejection (30007)' };
  return { ok: true, sid: `SIM${Math.random().toString(36).slice(2, 12)}` };
}
