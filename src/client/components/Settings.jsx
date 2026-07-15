import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Card } from './ui.jsx';

export default function Settings({ notify }) {
  const [settings, setSettings] = useState(null);
  const [authToken, setAuthToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [testTo, setTestTo] = useState('');
  const [testSending, setTestSending] = useState(false);

  useEffect(() => { api.get('/settings').then(setSettings); }, []);

  if (!settings) return <div className="loading">Loading…</div>;

  const set = (patch) => setSettings({ ...settings, ...patch });

  const saveAll = async () => {
    setSaving(true);
    try {
      const body = { ...settings };
      delete body.hasAuthToken;
      if (authToken) body.authToken = authToken;
      const next = await api.put('/settings', body);
      setSettings(next);
      setAuthToken('');
      notify('Settings saved');
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  const simulated = settings.provider !== 'twilio';

  const testConnection = async () => {
    setTesting(true);
    setConnection(null);
    try {
      const result = await api.post('/settings/test', {
        accountSid: settings.accountSid,
        authToken: authToken || undefined,
        fromNumber: settings.fromNumber
      });
      setConnection(result);
    } catch (err) {
      setConnection({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const sendTest = async () => {
    setTestSending(true);
    try {
      const result = await api.post('/settings/test-send', { to: testTo });
      notify(result.simulated ? 'Test message simulated ✓ (switch to Live for a real text)' : 'Test text sent — check your phone!');
    } catch (err) {
      notify(err.message, 'err');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="stack settings">
      <Card title="Sending mode" subtitle="Where your messages actually go.">
        <div className="mode-row">
          <button className={`mode ${simulated ? 'mode-on' : ''}`} onClick={() => set({ provider: 'simulation' })}>
            <span className="mode-title">Simulation</span>
            <span className="mode-desc">No real texts. Full app experience with realistic delivery — perfect for testing.</span>
          </button>
          <button className={`mode ${!simulated ? 'mode-on' : ''}`} onClick={() => set({ provider: 'twilio' })}>
            <span className="mode-title">Live (Twilio gateway)</span>
            <span className="mode-desc">Real SMS via your Twilio account credentials below.</span>
          </button>
        </div>
      </Card>

      <Card title="Gateway credentials" subtitle="Used only in Live mode. Stored locally in data/store.json — never committed.">
        <div className="stack-sm">
          <div className="field">
            <label className="label">Account SID</label>
            <input className="input mono" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={settings.accountSid} onChange={(e) => set({ accountSid: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Auth token {settings.hasAuthToken && !authToken && <span className="td-dim">(saved — leave blank to keep)</span>}</label>
            <input className="input mono" type="password" placeholder={settings.hasAuthToken ? '••••••••••••••••' : 'Your auth token'} value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">From number</label>
            <input className="input mono" placeholder="+15550100000" value={settings.fromNumber} onChange={(e) => set({ fromNumber: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Public base URL <span className="td-dim">(needed for live MMS)</span></label>
            <input className="input mono" placeholder="https://textradar.example.com" value={settings.publicBaseUrl || ''} onChange={(e) => set({ publicBaseUrl: e.target.value })} />
            <p className="hint">Carriers fetch pictures/GIFs/videos from your server, so it must be reachable on the internet when sending live MMS. Not needed in Simulation mode.</p>
          </div>

          <div className="row gap">
            <button className="btn" disabled={testing || !settings.accountSid} onClick={testConnection}>
              {testing ? 'Checking…' : 'Test connection'}
            </button>
            {connection && (
              connection.ok ? (
                <span className="conn conn-ok">
                  ✓ Connected to “{connection.account.name}” ({connection.account.status}
                  {connection.account.type === 'Trial' ? ' · trial' : ''})
                  {connection.fromNumberOk === true && ' · from-number verified'}
                  {connection.fromNumberOk === false && ' — but that from-number isn’t on this account'}
                </span>
              ) : (
                <span className="conn conn-err">✕ {connection.error}</span>
              )
            )}
          </div>

          <div className="field">
            <label className="label">Send a test text to yourself</label>
            <div className="row gap">
              <input className="input mono" placeholder="Your mobile number" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
              <button className="btn" disabled={!testTo.trim() || testSending} onClick={sendTest}>
                {testSending ? 'Sending…' : 'Send test'}
              </button>
            </div>
            <p className="hint">Uses your saved settings — save first if you just changed credentials. In Simulation mode this fakes the send.</p>
          </div>
        </div>
      </Card>

      <Card title="Delivery" subtitle="Pacing and compliance.">
        <div className="stack-sm">
          <div className="field">
            <label className="label">Messages per second: <strong>{settings.messagesPerSecond}</strong></label>
            <input
              type="range" min="1" max="30" className="slider"
              value={settings.messagesPerSecond}
              onChange={(e) => set({ messagesPerSecond: Number(e.target.value) })}
            />
          </div>
          <label className="check-row">
            <input type="checkbox" checked={settings.appendOptOut} onChange={(e) => set({ appendOptOut: e.target.checked })} />
            <span>Append opt-out notice to every message <span className="td-dim">(recommended — required for US marketing texts)</span></span>
          </label>
          {settings.appendOptOut && (
            <input className="input" value={settings.optOutText} onChange={(e) => set({ optOutText: e.target.value })} />
          )}
          <p className="hint">
            Inbound STOP replies are honored automatically when your provider's incoming-message webhook points at
            <code> /api/webhooks/inbound</code>. Only text people who agreed to hear from you.
          </p>
        </div>
      </Card>

      <div className="row end">
        <button className="btn btn-primary btn-lg" disabled={saving} onClick={saveAll}>{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </div>
  );
}
