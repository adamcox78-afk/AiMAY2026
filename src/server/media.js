// Text Radar — media storage for MMS attachments (pictures, GIFs, videos).
// Files arrive as data URLs, are written to data/media/, and are served at
// /media/<file>. For live Twilio sends the URL is prefixed with the public
// base URL from Settings so carriers can fetch it.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uid } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MEDIA_DIR = process.env.TEXT_RADAR_DATA_DIR
  ? path.join(process.env.TEXT_RADAR_DATA_DIR, 'media')
  : path.join(__dirname, '../../data/media');

const TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/3gpp': '.3gp'
};

export const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

/** Persist a data-URL upload. Returns { url, type, name, size } or { error }. */
export function saveMedia(dataUrl, originalName = '') {
  const match = /^data:([\w/.+-]+);base64,(.+)$/s.exec(String(dataUrl || ''));
  if (!match) return { error: 'Expected a base64 data URL.' };
  const [, type, b64] = match;
  const ext = TYPES[type];
  if (!ext) {
    return { error: `Unsupported media type "${type}". Use JPEG, PNG, GIF, WebP, MP4, MOV, or 3GP.` };
  }
  const buffer = Buffer.from(b64, 'base64');
  if (buffer.length === 0) return { error: 'Empty file.' };
  if (buffer.length > MAX_MEDIA_BYTES) {
    return { error: `File is ${(buffer.length / 1048576).toFixed(1)} MB — max is ${MAX_MEDIA_BYTES / 1048576} MB.` };
  }
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const id = uid('med');
  fs.writeFileSync(path.join(MEDIA_DIR, id + ext), buffer);
  return {
    url: `/media/${id}${ext}`,
    type,
    name: String(originalName || `attachment${ext}`).slice(0, 120),
    size: buffer.length
  };
}
