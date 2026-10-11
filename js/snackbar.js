/* ════════════════════════════════════════════════
   SNACKBAR — short messages at the bottom (replaces alert())
   An optional icon, then the message (Sentence case). Centred 24px above the
   bottom, or above any visible .snackbar-anchor in the same band. Auto-dismisses after 4s.
════════════════════════════════════════════════ */
const DURATION_MS = 4000;
const GAP = 16; // px between the snackbar and what it sits above

const bar    = document.getElementById('snackbar');
const text   = document.getElementById('snackbar-text');
const icon   = document.getElementById('snackbar-icon');
const action = document.getElementById('snackbar-action');
let timer = null, onAction = null;

action.addEventListener('click', () => {
  const fn = onAction;
  hideSnackbar();
  fn?.();
});

const isShown = el => el.getClientRects().length > 0;

// Elements the snackbar must not cover: anchors in the open overlay
function anchors() {
  return [...document.querySelectorAll('.overlay.active .snackbar-anchor')].filter(isShown);
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

// `message`: a string, or { text, icon } from copy.js (icon: "check" → #i-check in index.html's sprite)
export function showSnackbar(message, { actionLabel = '', onAction: fn = null } = {}) {
  clearTimeout(timer);
  const { text: words, icon: iconName = '' } = typeof message === 'string' ? { text: message } : message;
  text.textContent = words;
  icon.toggleAttribute('hidden', !iconName); // SVG has no .hidden property
  icon.querySelector('use').setAttribute('href', iconName ? `#i-${iconName}` : '');
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
