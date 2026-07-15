import { describe, it, expect } from 'vitest';
import { extractContacts, parseLine, parseVcf, splitCsvLine } from '../src/shared/parse.js';

describe('parseLine (free text / OCR output)', () => {
  it('extracts name + phone from natural lines', () => {
    expect(parseLine('Ada Lovelace 555-010-1815')).toEqual({ firstName: 'Ada', lastName: 'Lovelace', phone: '+15550101815' });
    expect(parseLine('(555) 010-1906  Grace Hopper')).toEqual({ firstName: 'Grace', lastName: 'Hopper', phone: '+15550101906' });
  });

  it('strips list bullets and labels', () => {
    expect(parseLine('1. Alan Turing 5550101912')).toEqual({ firstName: 'Alan', lastName: 'Turing', phone: '+15550101912' });
    expect(parseLine('- Name: Katherine Johnson Phone: +1 555 010 1918')).toEqual({ firstName: 'Katherine', lastName: 'Johnson', phone: '+15550101918' });
  });

  it('handles phone-only lines and rejects no-phone lines', () => {
    expect(parseLine('5550101815')).toEqual({ firstName: '', lastName: '', phone: '+15550101815' });
    expect(parseLine('just words here')).toBeNull();
    expect(parseLine('order #123 confirmed')).toBeNull();
  });
});

describe('splitCsvLine', () => {
  it('handles quoted cells with commas', () => {
    expect(splitCsvLine('"Lovelace, Ada",555-010-1815')).toEqual(['Lovelace, Ada', '555-010-1815']);
  });

  it('splits on commas, tabs, and semicolons', () => {
    expect(splitCsvLine('a\tb;c,d')).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('extractContacts', () => {
  it('parses CSV with a header row (header is dropped)', () => {
    const rows = extractContacts('First Name,Last Name,Phone\nAda,Lovelace,555-010-1815\nGrace,Hopper,(555) 010-1906');
    expect(rows).toEqual([
      { firstName: 'Ada', lastName: 'Lovelace', phone: '+15550101815' },
      { firstName: 'Grace', lastName: 'Hopper', phone: '+15550101906' }
    ]);
  });

  it('parses messy OCR-style text with noise lines', () => {
    const ocr = 'Team Contact List\n\n1. Ada Lovelace — 555-010-1815\n2. Grace Hopper (555) 010-1906\nPage 1 of 1';
    const rows = extractContacts(ocr);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ firstName: 'Ada', lastName: 'Lovelace', phone: '+15550101815' });
  });

  it('dedupes repeated phone numbers', () => {
    const rows = extractContacts('Ada 5550101815\nA. Lovelace 555-010-1815');
    expect(rows).toHaveLength(1);
  });

  it('parses single-column phone lists', () => {
    expect(extractContacts('5550101815\n5550101906')).toHaveLength(2);
  });
});

describe('parseVcf', () => {
  it('parses multi-card phone exports', () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Ada Lovelace', 'TEL;TYPE=CELL:+1 555 010 1815', 'END:VCARD',
      'BEGIN:VCARD', 'VERSION:3.0', 'N:Hopper;Grace;;;', 'TEL:5550101906', 'END:VCARD'
    ].join('\n');
    const rows = parseVcf(vcf);
    expect(rows).toEqual([
      { firstName: 'Ada', lastName: 'Lovelace', phone: '+15550101815' },
      { firstName: 'Grace', lastName: 'Hopper', phone: '+15550101906' }
    ]);
  });

  it('is picked up automatically by extractContacts', () => {
    const rows = extractContacts('BEGIN:VCARD\nFN:Alan Turing\nTEL:5550101912\nEND:VCARD');
    expect(rows).toEqual([{ firstName: 'Alan', lastName: 'Turing', phone: '+15550101912' }]);
  });
});
