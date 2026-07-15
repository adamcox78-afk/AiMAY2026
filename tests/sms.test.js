import { describe, it, expect } from 'vitest';
import { personalize, segmentInfo, normalizePhone, isOptOutMessage } from '../src/server/sms.js';

describe('personalize', () => {
  const contact = { firstName: 'Ada', lastName: 'Lovelace', phone: '+15550101815', fields: { city: 'London' } };

  it('fills name tokens', () => {
    expect(personalize('Hi {{firstName}} {{lastName}}!', contact)).toBe('Hi Ada Lovelace!');
    expect(personalize('Hello {{name}}', contact)).toBe('Hello Ada Lovelace');
  });

  it('is case/space tolerant and supports snake_case', () => {
    expect(personalize('Hi {{ first_name }}', contact)).toBe('Hi Ada');
    expect(personalize('Hi {{FirstName}}', contact)).toBe('Hi Ada');
  });

  it('resolves custom fields and blanks unknown tokens', () => {
    expect(personalize('{{city}} calling {{nope}}', contact)).toBe('London calling ');
  });

  it('handles empty templates', () => {
    expect(personalize('', contact)).toBe('');
    expect(personalize(null, contact)).toBe('');
  });
});

describe('segmentInfo', () => {
  it('counts single GSM-7 segment', () => {
    expect(segmentInfo('Hello world')).toEqual({ encoding: 'GSM-7', chars: 11, segments: 1 });
  });

  it('splits at 160 GSM-7 chars', () => {
    expect(segmentInfo('a'.repeat(160)).segments).toBe(1);
    expect(segmentInfo('a'.repeat(161)).segments).toBe(2);
    expect(segmentInfo('a'.repeat(306)).segments).toBe(2);
    expect(segmentInfo('a'.repeat(307)).segments).toBe(3);
  });

  it('counts GSM-7 extension chars as two', () => {
    expect(segmentInfo('{}').chars).toBe(4);
  });

  it('switches to UCS-2 for emoji with a 70-char first segment', () => {
    const info = segmentInfo('🎉' + 'a'.repeat(69));
    expect(info.encoding).toBe('UCS-2');
    expect(info.segments).toBe(1);
    expect(segmentInfo('🎉' + 'a'.repeat(70)).segments).toBe(2);
  });

  it('handles empty text', () => {
    expect(segmentInfo('').segments).toBe(0);
  });
});

describe('normalizePhone', () => {
  it('normalizes US formats to E.164', () => {
    expect(normalizePhone('(555) 010-1815')).toBe('+15550101815');
    expect(normalizePhone('555.010.1815')).toBe('+15550101815');
    expect(normalizePhone('1 555 010 1815')).toBe('+15550101815');
    expect(normalizePhone('+1 555 010 1815')).toBe('+15550101815');
  });

  it('keeps international numbers', () => {
    expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958');
  });

  it('rejects garbage', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('123')).toBeNull();
    expect(normalizePhone('not a phone')).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
  });
});

describe('isOptOutMessage', () => {
  it('matches opt-out keywords case-insensitively', () => {
    expect(isOptOutMessage('STOP')).toBe(true);
    expect(isOptOutMessage(' stop ')).toBe(true);
    expect(isOptOutMessage('unsubscribe')).toBe(true);
  });

  it('ignores normal replies', () => {
    expect(isOptOutMessage('stop by later!')).toBe(false);
    expect(isOptOutMessage('thanks')).toBe(false);
  });
});
