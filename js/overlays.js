/* ════════════════════════════════════════════════
   OVERLAY HELPERS
════════════════════════════════════════════════ */
export function showOverlay(id) {
  document.getElementById(id).classList.add('active');
}
export function hideOverlay(id) {
  document.getElementById(id).classList.remove('active');
}
export function hideAll() {
  ['camera-overlay','processing-overlay','review-overlay','detail-overlay'].forEach(hideOverlay);
}
