/* ════════════════════════════════════════════════
   DATE HELPERS
════════════════════════════════════════════════ */
export const fmtShort = d => d.toLocaleDateString('en-US', { month:'long', day:'numeric' });
export const fmtFull  = d => d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

/* ════════════════════════════════════════════════
   HTML ESCAPING
════════════════════════════════════════════════ */
export function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
