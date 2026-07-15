import React, { useState } from 'react';
import { api } from '../api.js';
import { Card, Stat, StatusPill, Empty, usePoll, fmtDate } from './ui.jsx';

export default function Dashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  usePoll(async (alive) => {
    const [s, c] = await Promise.all([api.get('/stats'), api.get('/campaigns')]);
    if (!alive()) return;
    setStats(s);
    setCampaigns(c.slice(0, 6));
  }, []);

  if (!stats) return <div className="loading">Loading…</div>;

  return (
    <div className="stack">
      <div className="hero">
        <h1>Text Radar</h1>
        <p>Send one message to everyone — delivered individually, personalized, and tracked.</p>
        <button className="btn btn-primary btn-lg" onClick={() => go('compose')}>New Blast</button>
      </div>

      <div className="stat-grid">
        <Stat label="Active contacts" value={stats.contacts} hint={stats.optedOut ? `${stats.optedOut} opted out` : 'all opted in'} />
        <Stat label="Messages sent" value={stats.sent} />
        <Stat label="Delivered" value={stats.delivered} tone="ok" />
        <Stat
          label="Delivery rate"
          value={stats.deliveryRate === null ? '—' : `${stats.deliveryRate}%`}
          tone={stats.deliveryRate !== null && stats.deliveryRate < 90 ? 'warn' : 'ok'}
          hint={stats.failed ? `${stats.failed} failed` : undefined}
        />
      </div>

      <Card title="Recent campaigns" actions={<button className="btn btn-ghost" onClick={() => go('campaigns')}>View all</button>}>
        {campaigns.length === 0 ? (
          <Empty
            icon="✉"
            title="No campaigns yet"
            hint="Add contacts, then compose your first blast."
            action={<button className="btn btn-primary" onClick={() => go('compose')}>Compose</button>}
          />
        ) : (
          <table className="table">
            <thead>
              <tr><th>Campaign</th><th>Status</th><th>Recipients</th><th>Delivered</th><th>Created</th></tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const delivered = c.recipients.filter((r) => r.status === 'delivered').length;
                return (
                  <tr key={c.id} className="row-link" onClick={() => go('campaigns')}>
                    <td className="td-strong">{c.name}</td>
                    <td><StatusPill status={c.status} /></td>
                    <td>{c.recipients.length}</td>
                    <td>{delivered}</td>
                    <td className="td-dim">{fmtDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
