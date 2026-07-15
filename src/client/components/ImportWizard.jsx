import React, { useRef, useState } from 'react';
import { api } from '../api.js';
import { extractContacts, normalizePhone } from '../../shared/parse.js';

const readAs = (file, mode) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    mode === 'text' ? reader.readAsText(file) : reader.readAsDataURL(file);
  });

/**
 * Full-screen import sheet. Sources: photo (camera or file), CSV/TXT/VCF file,
 * drag & drop, or pasted text. Everything lands in an editable review table
 * before anything is saved.
 */
export default function ImportWizard({ groups, notify, onClose, onDone }) {
  const [rows, setRows] = useState(null);       // null = source step; [] allowed
  const [busy, setBusy] = useState('');
  const [pasted, setPasted] = useState('');
  const [groupId, setGroupId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const toReview = (parsed, sourceLabel) => {
    if (parsed.length === 0) {
      notify(`No phone numbers found in ${sourceLabel}.`, 'err');
      return;
    }
    setRows(parsed.map((r, i) => ({ ...r, id: i, include: true })));
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    try {
      if (file.type.startsWith('image/')) {
        setBusy('Reading your photo… first scan downloads the text-recognition model, so it can take a minute.');
        const dataUrl = await readAs(file, 'dataUrl');
        const result = await api.post('/ocr', { image: dataUrl });
        setBusy('');
        toReview(result.rows, 'the photo');
      } else {
        const text = await readAs(file, 'text');
        toReview(extractContacts(text), file.name);
      }
    } catch (err) {
      setBusy('');
      notify(err.message, 'err');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const update = (id, patch) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const importNow = async () => {
    const chosen = rows.filter((r) => r.include && normalizePhone(r.phone));
    setBusy('Importing…');
    try {
      const result = await api.post('/contacts/import', {
        rows: chosen.map(({ firstName, lastName, phone }) => ({ firstName, lastName, phone })),
        groupIds: groupId ? [groupId] : []
      });
      notify(`Imported ${result.imported} contact${result.imported === 1 ? '' : 's'}${result.skipped ? ` · ${result.skipped} already existed` : ''}`);
      onDone();
    } catch (err) {
      setBusy('');
      notify(err.message, 'err');
    }
  };

  const validCount = rows ? rows.filter((r) => r.include && normalizePhone(r.phone)).length : 0;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2 className="card-title">{rows ? `Review ${rows.length} found` : 'Import contacts'}</h2>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        {busy ? (
          <div className="import-busy">
            <div className="spinner" />
            <p className="hint center">{busy}</p>
          </div>
        ) : rows === null ? (
          <div className="stack-sm">
            <div
              className={`dropzone ${dragOver ? 'dropzone-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="dropzone-icon">⇪</div>
              <div className="td-strong">Drop a file here, or click to browse</div>
              <div className="hint">Photo of a list · CSV · plain text · vCard (.vcf)</div>
            </div>

            <div className="source-row">
              <button className="source-btn" onClick={() => cameraRef.current?.click()}>
                <span className="source-icon">📷</span>
                <span>
                  <span className="td-strong">Take a photo</span>
                  <span className="hint"> — snap a printed or handwritten list; names next to numbers are picked up for personalization</span>
                </span>
              </button>
            </div>

            <div className="field">
              <label className="label">Or paste a list</label>
              <textarea
                className="input textarea mono"
                rows={4}
                placeholder={'Ada Lovelace 555-010-1815\nGrace, Hopper, (555) 010-1906\n+1 555 010 1912'}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
              <div className="row end" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" disabled={!pasted.trim()} onClick={() => toReview(extractContacts(pasted), 'the pasted text')}>
                  Extract contacts
                </button>
              </div>
            </div>

            <input ref={fileRef} type="file" accept=".csv,.txt,.vcf,text/*,image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFiles(e.target.files)} />
          </div>
        ) : (
          <>
            <p className="hint">Fix anything the scan got wrong — names personalize each text as <code>{'{{firstName}}'}</code>.</p>
            <div className="review-list">
              {rows.map((r) => {
                const valid = Boolean(normalizePhone(r.phone));
                return (
                  <div key={r.id} className={`review-row ${!r.include ? 'row-muted' : ''}`}>
                    <input type="checkbox" checked={r.include} onChange={(e) => update(r.id, { include: e.target.checked })} />
                    <input className="input" placeholder="First" value={r.firstName} onChange={(e) => update(r.id, { firstName: e.target.value })} />
                    <input className="input" placeholder="Last" value={r.lastName} onChange={(e) => update(r.id, { lastName: e.target.value })} />
                    <input className={`input mono ${valid ? '' : 'input-invalid'}`} value={r.phone} onChange={(e) => update(r.id, { phone: e.target.value })} />
                    <span className={`pill ${valid ? 'pill-delivered' : 'pill-failed'}`}>{valid ? 'OK' : 'Bad #'}</span>
                  </div>
                );
              })}
            </div>
            <div className="sheet-foot">
              <button className="btn btn-ghost" onClick={() => setRows(null)}>‹ Start over</button>
              <div className="row gap">
                <select className="input select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                  <option value="">No group</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>Add to “{g.name}”</option>)}
                </select>
                <button className="btn btn-primary" disabled={validCount === 0} onClick={importNow}>
                  Import {validCount}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
