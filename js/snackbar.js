/* ════════════════════════════════════════════════
   SNACKBAR — short messages at the bottom (replaces alert())
   Centred 24px above the bottom, or above the FAB / any visible
   .snackbar-anchor in the same band. Auto-dismisses after 4s.
════════════════════════════════════════════════ */
const DURATION_MS = 4000;
const GAP = 16; // px between the snackbar and what it sits above

const bar    = document.getElementById('snackbar');
const text   = document.getElementById('snackbar-text');
const action = document.getElementById('snackbar-action');
let timer = null, onAction = null;

action.addEventListener('click', () => {
  const fn = onAction;
  hideSnackbar();
  fn?.();
});

const isShown = el => el.getClientRects().length > 0;

// Elements the snackbar must not cover: the FAB, and anchors in the open overlay
function anchors() {
  const list = [...document.querySelectorAll('.overlay.active .snackbar-anchor')];
  const fab = document.getElementById('fab');
  if (!document.querySelector('.overlay.active') && isShown(fab)) list.push(fab);
  return list.filter(isShown);
}

function place() {
  bar.style.removeProperty('--snackbar-bottom');
  // offset* ignore the entering transform, so this is where the bar will settle
  const barRect = { top: bar.offsetTop, bottom: bar.offsetTop + bar.offsetHeight, height: bar.offsetHeight };
  let top = barRect.top;
  for (const el of anchors()) {
    const r = el.getBoundingClientRect();
    // vertical band only: a short centred message still sits above the FAB,
    // so the bar's position doesn't depend on its text length
    const overlaps = r.bottom > top - GAP && r.top < barRect.bottom;
    if (overlaps) top = Math.min(top, r.top - GAP - barRect.height);
  }
  if (top !== barRect.top) {
    bar.style.setProperty('--snackbar-bottom', `${window.innerHeight - top - barRect.height}px`);
  }
}

export function showSnackbar(message, { actionLabel = '', onAction: fn = null } = {}) {
  clearTimeout(timer);
  text.textContent = message;
  action.textContent = actionLabel;
  action.hidden = !actionLabel;
  bar.classList.toggle('snackbar--action', Boolean(actionLabel));
  onAction = fn;
  bar.classList.add('visible');
  place();
  timer = setTimeout(hideSnackbar, DURATION_MS);
}

export function hideSnackbar() {
  clearTimeout(timer);
  onAction = null;
  bar.classList.remove('visible');
}
