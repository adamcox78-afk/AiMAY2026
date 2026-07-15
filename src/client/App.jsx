import React, { useEffect, useState, useCallback } from 'react';
import Dashboard from './components/Dashboard.jsx';
import Contacts from './components/Contacts.jsx';
import Compose from './components/Compose.jsx';
import Campaigns from './components/Campaigns.jsx';
import Settings from './components/Settings.jsx';
import { Toast } from './components/ui.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'contacts', label: 'Contacts', icon: '⊚' },
  { id: 'compose', label: 'New Blast', icon: '✉' },
  { id: 'campaigns', label: 'Campaigns', icon: '☰' },
  { id: 'settings', label: 'Settings', icon: '⚙' }
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, kind = 'ok') => {
    setToast({ message, kind, key: Date.now() });
  }, []);

  useEffect(() => { setQuery(''); }, [tab]);

  const pageProps = { query, notify, go: setTab };

  return (
    <div className="browser">
      <header className="chrome">
        <div className="chrome-tabstrip">
          <div className="traffic-lights" aria-hidden="true">
            <span className="light red" /><span className="light yellow" /><span className="light green" />
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`chrome-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="chrome-tab-icon">{t.icon}</span>
              <span className="chrome-tab-label">{t.label}</span>
            </button>
          ))}
          <button className="chrome-newtab" title="New blast" onClick={() => setTab('compose')}>+</button>
        </div>

        <div className="chrome-toolbar">
          <div className="nav-buttons">
            <button className="nav-btn" title="Dashboard" onClick={() => setTab('dashboard')}>‹</button>
            <button className="nav-btn" title="Refresh" onClick={() => window.dispatchEvent(new Event('tr:refresh'))}>⟳</button>
          </div>
          <div className="omnibox">
            <span className="omnibox-lock" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <rect x="4" y="10" width="16" height="11" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <span className="omnibox-scheme">textradar://{tab}</span>
            <input
              className="omnibox-input"
              placeholder="Search contacts and campaigns…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button className="omnibox-clear" onClick={() => setQuery('')}>✕</button>}
          </div>
          <div className="avatar" title="Text Radar">TR</div>
        </div>
      </header>

      <main className="page">
        {tab === 'dashboard' && <Dashboard {...pageProps} />}
        {tab === 'contacts' && <Contacts {...pageProps} />}
        {tab === 'compose' && <Compose {...pageProps} />}
        {tab === 'campaigns' && <Campaigns {...pageProps} />}
        {tab === 'settings' && <Settings {...pageProps} />}
      </main>

      {toast && <Toast key={toast.key} message={toast.message} kind={toast.kind} onDone={() => setToast(null)} />}
    </div>
  );
}
