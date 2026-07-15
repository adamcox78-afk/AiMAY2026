import React, { useState } from 'react';
import { api } from '../api.js';
import { Card, StatusPill, Empty, usePoll, fmtDate } from './ui.jsx';

export default function Campaigns({ query, notify, go }) {
  const [campaigns, setCampaigns] = useState([]);
  const [openId, setOpenId] = useState(null);

  usePoll(async (alive) => {
    const c = await api.get('/campaigns');
    if (alive()) setCampaigns(c);
  }, [], 2000);

  const q = query.trim().toLowerCase();
  const visible = campaigns.filter((c) => !q || c.name.toLowerCase().includes(q) || c.message.toLowerCase().includes(q));
  const open = campaigns.find((c) => c.id === openId);

  const act = async (id, action) => {
    try {
      await api.post(`/campaigns/${id}/${action}`);
      notify(action === 'pause' ? 'Campaign paused' : 'Campaign resumed');
    } catch (err) { notify(err.message, 'err'); }
  };

  if (open) {
    const delivered = open.recipients.filter((r) => r.status === 'delivered').length;
    const failed = open.recipients.filter((r) => r.status === 'failed').length;
    const done = delivered + failed;
    const pct = Math.round((done / open.recipients.length) * 100);
    return (
      <div className="stack">
        <Card
          title={open.name}
          subtitle={`Created ${fmtDate(open.createdAt)} · ${open.segmentsPerMessage} segment${open.segmentsPerMessage === 1 ? '' : 's'} per message`}
          actions={
            <div className="row gap">
              {open.status === 'sending' && <button className="btn" onClick={() => act(open.id, 'pause')}>Pause</button>}
              {open.status === 'paused' && <button className="btn btn-primary" onClick={() => act(open.id, 'start')}>Resume</button>}
              <button className="btn btn-ghost" onClick={() => setOpenId(null)}>‹ All campaigns</button>
            </div>
          }
        >
          <div className="progress-row">
            <StatusPill status={open.status} />
            <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            <span className="td-dim">{done}/{open.recipients.length} · {delivered} delivered{failed ? ` · ${failed} failed` : ''}</span>
          </div>
          {open.media?.length > 0 && (
            <div className="attach-row">
              {open.media.map((m) => (
                <div key={m.url} className="attach-thumb">
                  {m.type.startsWith('video/') ? <video src={m.url} muted /> : <img src={m.url} alt={m.name} />}
                </div>
              ))}
              <span className="hint">{open.media.length} attachment{open.media.length === 1 ? '' : 's'} (MMS)</span>
            </div>
          )}
          <blockquote className="message-quote">{open.message}</blockquote>
          <table className="table">
            <thead><tr><th>Recipient</th><th>Phone</th><th>Status</th><th>Detail</th><th>Sent</th></tr></thead>
            <tbody>
              {open.recipients.map((r) => (
                <tr key={r.contactId}>
                  <td className="td-strong">{r.name}</td>
                  <td className="mono">{r.phone}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="td-dim">{r.error || r.sid || '—'}</td>
                  <td className="td-dim">{fmtDate(r.sentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  return (
    <div className="stack">
      <Card title={`Campaigns · ${visible.length}`}>
        {visible.length === 0 ? (
          <Empty
            icon="☰"
            title={q ? 'No campaigns match your search' : 'No campaigns yet'}
            action={q ? undefined : <button className="btn btn-primary" onClick={() => go('compose')}>Compose your first blast</button>}
          />
        ) : (
          <table className="table">
            <thead><tr><th>Campaign</th><th>Status</th><th>Progress</th><th>Message</th><th>Created</th><th /></tr></thead>
            <tbody>
              {visible.map((c) => {
                const done = c.recipients.filter((r) => r.status === 'delivered' || r.status === 'failed').length;
                const pct = Math.round((done / c.recipients.length) * 100);
                return (
                  <tr key={c.id} className="row-link" onClick={() => setOpenId(c.id)}>
                    <td className="td-strong">{c.name}</td>
                    <td><StatusPill status={c.status} /></td>
                    <td className="td-progress">
                      <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="td-dim">{done}/{c.recipients.length}</span>
                    </td>
                    <td className="td-dim td-ellipsis">{c.message}</td>
                    <td className="td-dim">{fmtDate(c.createdAt)}</td>
                    <td>
                      {c.status === 'sending' && <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); act(c.id, 'pause'); }}>Pause</button>}
                      {c.status === 'paused' && <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); act(c.id, 'start'); }}>Resume</button>}
                    </td>
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
