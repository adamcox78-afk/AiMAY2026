import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api.js';
import { Card } from './ui.jsx';

const TOKENS = ['{{firstName}}', '{{lastName}}', '{{name}}'];

export default function Compose({ notify, go }) {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groupIds, setGroupIds] = useState([]);
  const [contactIds, setContactIds] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [sampleIx, setSampleIx] = useState(0);
  const textRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/groups'), api.get('/contacts')]).then(([g, c]) => {
      setGroups(g);
      setContacts(c.filter((x) => !x.optedOut));
    });
  }, []);

  // Live preview (debounced) — personalized body + segment math from the server.
  useEffect(() => {
    if (!message.trim() || (groupIds.length === 0 && contactIds.length === 0)) { setPreview(null); return; }
    const t = setTimeout(() => {
      api.post('/campaigns/preview', { message, groupIds, contactIds }).then(setPreview).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [message, groupIds, contactIds]);

  useEffect(() => { setSampleIx(0); }, [preview?.recipientCount]);

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const insertToken = (token) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? message.length;
    const end = el?.selectionEnd ?? message.length;
    const next = message.slice(0, start) + token + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const send = async () => {
    setSending(true);
    try {
      const campaign = await api.post('/campaigns', { name, message, groupIds, contactIds, sendNow: true });
      notify(`Blast started — sending to ${campaign.recipients.length} recipient${campaign.recipients.length === 1 ? '' : 's'}`);
      go('campaigns');
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setSending(false);
    }
  };

  const sample = preview?.samples?.[sampleIx];
  const recipientCount = preview?.recipientCount ?? 0;
  const canSend = message.trim() && recipientCount > 0 && !sending;
  const seg = preview?.segments;

  const selectedSummary = useMemo(() => {
    const parts = [];
    if (groupIds.length) parts.push(`${groupIds.length} group${groupIds.length === 1 ? '' : 's'}`);
    if (contactIds.length) parts.push(`${contactIds.length} individual${contactIds.length === 1 ? '' : 's'}`);
    return parts.join(' + ') || 'no one yet';
  }, [groupIds, contactIds]);

  return (
    <div className="split compose">
      <div className="split-main stack">
        <Card title="Audience" subtitle={`Sending to ${selectedSummary}${recipientCount ? ` — ${recipientCount} unique number${recipientCount === 1 ? '' : 's'}` : ''}`}>
          {groups.length > 0 && (
            <div className="field">
              <label className="label">Groups</label>
              <div className="chip-row">
                {groups.map((g) => (
                  <button key={g.id} className={`chip chip-lg ${groupIds.includes(g.id) ? 'chip-on' : ''}`} onClick={() => toggle(groupIds, setGroupIds, g.id)}>
                    {g.name} <span className="chip-count">{g.memberCount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="field">
            <label className="label">Individual contacts</label>
            {contacts.length === 0 ? (
              <p className="hint">No contacts yet — add some on the Contacts tab first.</p>
            ) : (
              <div className="chip-row chip-scroll">
                {contacts.map((c) => (
                  <button key={c.id} className={`chip ${contactIds.includes(c.id) ? 'chip-on' : ''}`} onClick={() => toggle(contactIds, setContactIds, c.id)}>
                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Message">
          <input className="input" placeholder="Campaign name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="token-row">
            <span className="hint">Personalize:</span>
            {TOKENS.map((t) => (
              <button key={t} className="chip mono" onClick={() => insertToken(t)}>{t}</button>
            ))}
          </div>
          <textarea
            ref={textRef}
            className="input textarea"
            rows={6}
            placeholder={'Hi {{firstName}}! Doors open at 7 — see you there.'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="compose-footer">
            <span className="hint">
              {seg ? `${seg.chars} chars · ${seg.segments} segment${seg.segments === 1 ? '' : 's'} per message (${seg.encoding})` : 'Each recipient gets their own individual text.'}
            </span>
            <button className="btn btn-primary btn-lg" disabled={!canSend} onClick={send}>
              {sending ? 'Starting…' : recipientCount ? `Send to ${recipientCount}` : 'Send'}
            </button>
          </div>
        </Card>
      </div>

      <div className="split-side">
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="phone-header">
              <div className="phone-avatar">{(sample?.name || 'T R').split(/\s+/).map((w) => w[0]).slice(0, 2).join('')}</div>
              <div className="phone-contact">{sample?.name || 'Preview'}</div>
              <div className="phone-number mono">{sample?.phone || ''}</div>
            </div>
            <div className="phone-messages">
              {sample ? (
                <div className="bubble">{sample.body}</div>
              ) : (
                <div className="phone-empty">Pick an audience and write a message to preview it here.</div>
              )}
            </div>
            {preview?.samples?.length > 1 && (
              <div className="phone-pager">
                {preview.samples.map((s, i) => (
                  <button key={s.phone} className={`dot ${i === sampleIx ? 'dot-on' : ''}`} onClick={() => setSampleIx(i)} aria-label={`Preview for ${s.name}`} />
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="hint center">Live preview — exactly what each person receives.</p>
      </div>
    </div>
  );
}
