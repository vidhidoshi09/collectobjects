import { reducedMotion } from './motion.js';

/* ════════════════════════════════════════════════
   FLIGHT — the object flies between its grid tile and the close-up
   A copy of the cut-out (the "flyer") is laid over everything and moved from
   one box to the other while the screens cross-fade underneath; the real
   images stay hidden until it lands. Both boxes are squares with the cut-out
   contained, so one translate + scale lines them up. Fades only with reduce motion.
════════════════════════════════════════════════ */
const OPEN_MS  = 460;
const CLOSE_MS = 380;
const EASE_OPEN  = 'cubic-bezier(0.3, 1.25, 0.5, 1)'; // a soft overshoot as it lands
const EASE_CLOSE = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Moves `img`'s picture from the `from` box to the `to` element, hiding both real images meanwhile
export async function fly(img, fromRect, toEl, { opening }) {
  if (reducedMotion() || !fromRect || !toEl) return;
  const to = toEl.getBoundingClientRect();
  if (!to.width || !fromRect.width) return;

  const flyer = img.cloneNode();
  flyer.removeAttribute('id');
  flyer.removeAttribute('style'); // not the real image's hidden state
  flyer.className = `${img.className} flyer`;
  Object.assign(flyer.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
  document.body.append(flyer);

  const scale = fromRect.width / to.width;
  const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
  const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
  const start = `translate(${dx}px, ${dy}px) scale(${scale})`;
  const frames = opening ? [{ transform: start }, { transform: 'none' }] : [{ transform: 'none' }, { transform: start }];

  try {
    await flyer.animate(frames, { duration: opening ? OPEN_MS : CLOSE_MS, easing: opening ? EASE_OPEN : EASE_CLOSE }).finished;
  } catch { /* interrupted: land where it is */ }
  flyer.remove();
}

// The object shrinks away in the close-up (delete), before the screen closes
export async function poof(el) {
  if (reducedMotion()) return;
  try {
    await el.animate(
      [{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: 'scale(0.6)', opacity: 0, filter: 'blur(6px)' }],
      { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    ).finished;
  } catch { /* interrupted */ }
}
