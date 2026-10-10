/* ════════════════════════════════════════════════
   OVERLAY HELPERS
════════════════════════════════════════════════ */
export function showOverlay(id) {
  document.getElementById(id).classList.add('active');
  document.getElementById('fab').style.display = 'none';
}
export function hideOverlay(id) {
  document.getElementById(id).classList.remove('active');
}
export function hideAll() {
  ['camera-overlay','processing-overlay','review-overlay','detail-overlay'].forEach(hideOverlay);
  document.getElementById('fab').style.display = 'flex';
}
