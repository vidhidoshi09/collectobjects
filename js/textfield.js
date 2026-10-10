/* ════════════════════════════════════════════════
   TEXT FIELDS
   Multi-line filled fields grow with their text instead of scrolling.
════════════════════════════════════════════════ */
export function autoGrow(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}
