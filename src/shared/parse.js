// Text Radar — contact extraction shared by client and server.
// Turns messy input (OCR text from a photo, CSV files, pasted lists, vCards)
// into { firstName, lastName, phone } rows ready for review and import.

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

const PHONE_RE = /(\+?[\d(][\d\s().\-‐-―]{7,}\d)/;
const HEADER_WORDS = /^(first\s*name|last\s*name|full\s*name|name|phone|phone\s*number|number|mobile|cell|tel|telephone|contact|email)$/i;

function cleanName(text) {
  return String(text || '')
    .replace(/^\s*(\d{1,3}[.)]|[-•*·>])\s*/, '')          // list bullets: "1." "-" "•"
    .replace(/\b(name|phone|number|mobile|cell|tel)\s*[:=]/gi, ' ')
    .replace(/[|;:,"'\t]+/g, ' ')
    .replace(/[^\p{L}\p{M}' .-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitName(full) {
  const words = cleanName(full).split(' ').filter(Boolean);
  if (words.length === 0) return { firstName: '', lastName: '' };
  return { firstName: words[0], lastName: words.slice(1).join(' ') };
}

/** Parse a single line of free text ("Ada Lovelace 555-010-1815") into a row, or null. */
export function parseLine(line) {
  const match = String(line || '').match(PHONE_RE);
  if (!match) return null;
  const phone = normalizePhone(match[1]);
  if (!phone) return null;
  const remainder = line.replace(match[1], ' ');
  return { ...splitName(remainder), phone };
}

/** Split one CSV line respecting double quotes. */
export function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',' || ch === '\t' || ch === ';') { cells.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function rowFromCells(cells) {
  const phoneIx = cells.findIndex((c) => normalizePhone(c));
  if (phoneIx === -1) return null;
  const phone = normalizePhone(cells[phoneIx]);
  const nameCells = cells.filter((_, i) => i !== phoneIx).map(cleanName).filter(Boolean);
  if (nameCells.length >= 2) {
    return { firstName: nameCells[0], lastName: nameCells[1], phone };
  }
  return { ...splitName(nameCells[0] || ''), phone };
}

/** Parse vCard (.vcf) content — handles multi-card files from phone exports. */
export function parseVcf(text) {
  const rows = [];
  for (const card of String(text).split(/BEGIN:VCARD/i).slice(1)) {
    const fn = card.match(/^FN[^:]*:(.+)$/im)?.[1];
    const n = card.match(/^N[^:]*:(.+)$/im)?.[1];
    const tel = card.match(/^TEL[^:]*:(.+)$/im)?.[1];
    const phone = normalizePhone(tel);
    if (!phone) continue;
    let name = { firstName: '', lastName: '' };
    if (fn) name = splitName(fn);
    else if (n) {
      const [last = '', first = ''] = n.split(';');
      name = { firstName: cleanName(first), lastName: cleanName(last) };
    }
    rows.push({ ...name, phone });
  }
  return rows;
}

/**
 * Extract contact rows from any text: OCR output, CSV, TSV, or a pasted list.
 * Lines that look like headers or contain no valid phone number are dropped.
 * Rows are deduped by phone (first occurrence wins).
 */
export function extractContacts(text) {
  const raw = String(text ?? '');
  if (/BEGIN:VCARD/i.test(raw)) return dedupe(parseVcf(raw));

  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = splitCsvLine(line);
    const row = cells.length > 1 ? rowFromCells(cells) : parseLine(line);
    if (row) rows.push(row);
    // silently drop header-ish lines ("Name, Phone"); anything else without
    // a valid phone is also unusable, so it's dropped too
  }
  return dedupe(rows);
}

function dedupe(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    if (seen.has(r.phone)) return false;
    seen.add(r.phone);
    return true;
  });
}
