import React, { useState } from 'react';
import { api } from '../api.js';
import { Card, Empty, usePoll } from './ui.jsx';
import ImportWizard from './ImportWizard.jsx';

export default function Contacts({ query, notify }) {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', groupIds: [] });
  const [newGroup, setNewGroup] = useState('');
  const [showImport, setShowImport] = useState(false);

  const refresh = async (alive = () => true) => {
    const [c, g] = await Promise.all([api.get('/contacts'), api.get('/groups')]);
    if (!alive()) return;
    setContacts(c);
    setGroups(g);
  };
  usePoll(refresh, [], 5000);

  const q = query.trim().toLowerCase();
  const visible = contacts.filter((c) =>
    !q || `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(q)
  );

  const addContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', form);
      setForm({ firstName: '', lastName: '', phone: '', groupIds: form.groupIds });
      notify('Contact added');
      refresh();
    } catch (err) { notify(err.message, 'err'); }
  };

  const addGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.trim()) return;
    try {
      await api.post('/groups', { name: newGroup });
      setNewGroup('');
      notify('Group created');
      refresh();
    } catch (err) { notify(err.message, 'err'); }
  };

  const toggleFormGroup = (id) => {
    setForm((f) => ({
      ...f,
      groupIds: f.groupIds.includes(id) ? f.groupIds.filter((g) => g !== id) : [...f.groupIds, id]
    }));
  };

  const toggleContactGroup = async (contact, groupId) => {
    const groupIds = contact.groupIds.includes(groupId)
      ? contact.groupIds.filter((g) => g !== groupId)
      : [...contact.groupIds, groupId];
    await api.patch(`/contacts/${contact.id}`, { groupIds });
    refresh();
  };

  const setOptedOut = async (contact, optedOut) => {
    await api.patch(`/contacts/${contact.id}`, { optedOut });
    refresh();
  };

  const remove = async (contact) => {
    if (!window.confirm(`Delete ${contact.firstName || contact.phone}? This can't be undone.`)) return;
    await api.del(`/contacts/${contact.id}`);
    notify('Contact deleted');
    refresh();
  };

  return (
    <div className="split">
      {showImport && (
        <ImportWizard
          groups={groups}
          notify={notify}
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); refresh(); }}
        />
      )}
      <div className="split-main">
        <Card
          title={`Contacts${q ? ` · ${visible.length} match${visible.length === 1 ? '' : 'es'}` : ` · ${contacts.length}`}`}
          actions={<button className="btn btn-primary" onClick={() => setShowImport(true)}>⇪ Import — photo, CSV, paste</button>}
        >
          {visible.length === 0 ? (
            <Empty
              icon="⊚"
              title={q ? 'No contacts match your search' : 'No contacts yet'}
              hint={q ? undefined : 'Snap a photo of a list, drop a CSV, or add people one by one.'}
              action={q ? undefined : <button className="btn btn-primary" onClick={() => setShowImport(true)}>Import contacts</button>}
            />
          ) : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Groups</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className={c.optedOut ? 'row-muted' : ''}>
                    <td className="td-strong">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="mono">{c.phone}</td>
                    <td>
                      <div className="chip-row">
                        {groups.map((g) => (
                          <button
                            key={g.id}
                            className={`chip ${c.groupIds.includes(g.id) ? 'chip-on' : ''}`}
                            onClick={() => toggleContactGroup(c, g.id)}
                          >{g.name}</button>
                        ))}
                      </div>
                    </td>
                    <td>
                      {c.optedOut
                        ? <button className="pill pill-failed pill-btn" onClick={() => setOptedOut(c, false)}>Opted out</button>
                        : <button className="pill pill-delivered pill-btn" onClick={() => setOptedOut(c, true)}>Subscribed</button>}
                    </td>
                    <td><button className="btn btn-ghost btn-danger" onClick={() => remove(c)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="split-side">
        <Card title="Add contact">
          <form className="stack-sm" onSubmit={addContact}>
            <div className="row gap">
              <input className="input" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <input className="input" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <input className="input" placeholder="Phone — (555) 010-1815" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            {groups.length > 0 && (
              <div className="chip-row">
                {groups.map((g) => (
                  <button type="button" key={g.id} className={`chip ${form.groupIds.includes(g.id) ? 'chip-on' : ''}`} onClick={() => toggleFormGroup(g.id)}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-primary" type="submit">Add contact</button>
          </form>
        </Card>

        <Card title="Groups" subtitle="Organize contacts into audiences for targeted blasts.">
          <form className="row gap" onSubmit={addGroup}>
            <input className="input" placeholder="New group name" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
            <button className="btn" type="submit">Create</button>
          </form>
          <ul className="group-list">
            {groups.map((g) => (
              <li key={g.id}>
                <span className="td-strong">{g.name}</span>
                <span className="td-dim">{g.memberCount} member{g.memberCount === 1 ? '' : 's'}</span>
                <button
                  className="btn btn-ghost btn-danger"
                  onClick={async () => { await api.del(`/groups/${g.id}`); refresh(); }}
                >✕</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
