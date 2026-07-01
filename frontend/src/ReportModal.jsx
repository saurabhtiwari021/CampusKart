/* ── Report Modal ─────────────────────────────────────────────────────── */
import { useState } from 'react';
import { useApp } from './AppContext';
import { Ico } from './icons';
import { api } from './api';

/** target: { type: 'listing'|'user', id, label } */
export function ReportModal({ target, onClose }) {
  const { toast } = useApp();
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await api.reports.create(trimmed, target.type === 'listing' ? { listingId: target.id } : { userId: target.id });
      toast.success('Report submitted. Thanks for keeping CampusKart safe!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not submit report');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ico n="flag" c="w-5 h-5" /> Report {target.type === 'listing' ? 'this listing' : 'this user'}
        </h2>
        {target.label && (
          <p style={{ color: 'var(--text-soft)', fontSize: '.88rem', marginBottom: 12 }}>{target.label}</p>
        )}
        <textarea
          className="input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What's wrong with this? Give a bit of detail so an admin can look into it."
          style={{ minHeight: 110, marginTop: 8 }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-coral" style={{ flex: 1 }} onClick={submit} disabled={sending || !reason.trim()}>
            {sending ? <Ico n="loader" c="w-5 h-5 spin" /> : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
