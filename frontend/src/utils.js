/* ── Utilities ────────────────────────────────────────────────────────── */
export const uid = () => Math.random().toString(36).slice(2,10);
export const inr = (n) => n === 0 ? 'Free' : `₹${Number(n).toLocaleString('en-IN')}`;
export const getLS = (k,d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
export const setLS = (k,v) => localStorage.setItem(k,JSON.stringify(v));
export const timeAgo = (ts) => {
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return 'just now';
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};
/** "3:45 PM" — used for chat message bubbles, where a relative time is too coarse. */
export const timeShort = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit' });
