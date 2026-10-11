/* ════════════════════════════════════════════════
   DATE HELPERS
   Records keep the date as saved ("October 10, 2026", en-US) so the data
   format never changes; it is reformatted for display (lowercase, short month).
════════════════════════════════════════════════ */
export const fmtStored = d => d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

const toDate = v => (v instanceof Date ? v : new Date(v));
const lower = (d, opts) => d.toLocaleDateString('en-US', opts).toLowerCase();

// "oct 11"
export const fmtDay = v => lower(toDate(v), { month:'short', day:'numeric' });
// "oct 11" this year, "oct 11, 2025" for an earlier (or later) year
export function fmtShortDate(v, now = new Date()) {
  const d = toDate(v);
  if (isNaN(d)) return String(v).toLowerCase();
  return d.getFullYear() === now.getFullYear() ? fmtDay(d) : fmtDate(d);
}
// "oct 10, 2026"; a stored date that can't be read is shown as written
export function fmtDate(v) {
  const d = toDate(v);
  return isNaN(d) ? String(v).toLowerCase() : lower(d, { month:'short', day:'numeric', year:'numeric' });
}

/* ════════════════════════════════════════════════
   HTML ESCAPING
════════════════════════════════════════════════ */
export function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
