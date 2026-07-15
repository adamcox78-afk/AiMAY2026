import { describe, it, expect } from 'vitest';
import { resolveRecipients, campaignStats } from '../src/server/engine.js';

const state = {
  contacts: [
    { id: 'a', firstName: 'Ada', phone: '+15550100001', groupIds: ['g1'], optedOut: false },
    { id: 'b', firstName: 'Bob', phone: '+15550100002', groupIds: ['g1'], optedOut: true },
    { id: 'c', firstName: 'Cy', phone: '+15550100003', groupIds: ['g2'], optedOut: false },
    { id: 'd', firstName: 'Dupe', phone: '+15550100001', groupIds: ['g2'], optedOut: false }
  ],
  groups: [{ id: 'g1', name: 'One' }, { id: 'g2', name: 'Two' }],
  campaigns: []
};

describe('resolveRecipients', () => {
  it('expands groups and skips opted-out contacts', () => {
    const out = resolveRecipients(state, { groupIds: ['g1'] });
    expect(out.map((c) => c.id)).toEqual(['a']);
  });

  it('merges groups with individual picks, deduping by phone', () => {
    const out = resolveRecipients(state, { contactIds: ['a'], groupIds: ['g2'] });
    // 'd' shares a's phone number, so only one of them gets a text
    expect(out).toHaveLength(2);
    const phones = out.map((c) => c.phone);
    expect(new Set(phones).size).toBe(phones.length);
  });

  it('returns empty for an empty selection', () => {
    expect(resolveRecipients(state, {})).toEqual([]);
  });
});

describe('campaignStats', () => {
  it('aggregates delivery counts across campaigns', () => {
    const withCampaigns = {
      ...state,
      campaigns: [{
        recipients: [
          { status: 'delivered' }, { status: 'delivered' }, { status: 'failed' }, { status: 'pending' }
        ]
      }]
    };
    const stats = campaignStats(withCampaigns);
    expect(stats.sent).toBe(3);
    expect(stats.delivered).toBe(2);
    expect(stats.failed).toBe(1);
    expect(stats.deliveryRate).toBe(66.7);
    expect(stats.contacts).toBe(3);
    expect(stats.optedOut).toBe(1);
  });

  it('reports null delivery rate before any sends', () => {
    expect(campaignStats(state).deliveryRate).toBeNull();
  });
});
