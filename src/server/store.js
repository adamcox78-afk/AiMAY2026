// Text Radar — tiny JSON-file data store.
// Everything persists to data/store.json so the app survives restarts
// without needing a database. Writes are debounced and atomic.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.TEXT_RADAR_DATA_DIR || path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULTS = {
  contacts: [],
  groups: [],
  campaigns: [],
  settings: {
    provider: 'simulation',        // 'simulation' | 'twilio'
    accountSid: '',
    authToken: '',
    fromNumber: '',
    messagesPerSecond: 5,
    appendOptOut: true,
    optOutText: 'Reply STOP to opt out.'
  }
};

let state = null;
let writeTimer = null;

function load() {
  if (state) return state;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
    state.settings = { ...DEFAULTS.settings, ...(state.settings || {}) };
  } catch {
    state = structuredClone(DEFAULTS);
  }
  return state;
}

function flush() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

export function save() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try { flush(); } catch (err) { console.error('store: write failed', err); }
  }, 150);
}

export function saveNow() {
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  flush();
}

export function db() {
  return load();
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
