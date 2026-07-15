import React, { useEffect, useState } from 'react';

/** Auto-refresh hook: refetches on an interval and on the toolbar refresh button. */
export function usePoll(fn, deps = [], ms = 2500) {
  useEffect(() => {
    let alive = true;
    const run = () => fn(() => alive);
    run();
    const timer = setInterval(run, ms);
    window.addEventListener('tr:refresh', run);
    return () => { alive = false; clearInterval(timer); window.removeEventListener('tr:refresh', run); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export function StatusPill({ status }) {
  const labels = {
    queued: 'Queued', sending: 'Sending', paused: 'Paused', completed: 'Completed',
    pending: 'Pending', delivered: 'Delivered', failed: 'Failed'
  };
  return <span className={`pill pill-${status}`}>{labels[status] || status}</span>;
}

export function Toast({ message, kind = 'ok', onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(onDone, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return <div className={`toast toast-${kind} ${leaving ? 'toast-leave' : ''}`}>{message}</div>;
}

export function Empty({ icon = '◉', title, hint, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {action}
    </div>
  );
}

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
