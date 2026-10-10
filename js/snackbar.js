/* ════════════════════════════════════════════════
   SNACKBAR — short messages at the bottom (replaces alert())
   Sits 16px above the bottom, or above the FAB / any visible
   .snackbar-anchor it would otherwise cover. Auto-dismisses after 4s.
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

// Where an element will be once its overlay has finished rising in
function settledRect(el) {
  const r = el.getBoundingClientRect();
  const overlay = el.closest('.overlay');
  const shift = overlay ? new DOMMatrixReadOnly(getComputedStyle(overlay).transform).m42 : 0;
  return { top: r.top - shift, bottom: r.bottom - shift, left: r.left, right: r.right };
}

function place() {
  bar.style.removeProperty('--snackbar-bottom');
  // offset* ignore the entering transform, so this is where the bar will settle
  const barRect = {
    top: bar.offsetTop, bottom: bar.offsetTop + bar.offsetHeight, height: bar.offsetHeight,
    left: bar.offsetLeft, right: bar.offsetLeft + bar.offsetWidth,
  };
  let top = barRect.top;
  for (const el of anchors()) {
    const r = settledRect(el);
    const overlaps = r.bottom > top - GAP && r.top < barRect.bottom
      && r.right > barRect.left && r.left < barRect.right;
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
