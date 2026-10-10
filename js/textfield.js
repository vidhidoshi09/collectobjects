/* ════════════════════════════════════════════════
   TEXT FIELDS
   The story field grows with its text instead of scrolling.
════════════════════════════════════════════════ */
export function autoGrow(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}
