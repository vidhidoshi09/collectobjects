/* ════════════════════════════════════════════════
   RIPPLE — Material press feedback
   Any element with class "ripple" gets a wave from the touch point
   (pressed state layer). Hover/focus layers are pure CSS (css/app.css).
════════════════════════════════════════════════ */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function startRipple(e) {
  if (e.button !== 0) return;
  const host = e.target.closest('.ripple');
  if (!host || host.disabled) return;

  const clip = document.createElement('span');
  clip.className = 'ripple__clip';
  clip.setAttribute('aria-hidden', 'true');
  const wave = document.createElement('span');
  wave.className = 'ripple__wave';
  clip.appendChild(wave);
  host.appendChild(clip);

  // A circle centred on the touch point that reaches the farthest corner
  const r = clip.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const radius = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
  Object.assign(wave.style, {
    width: `${radius * 2}px`, height: `${radius * 2}px`,
    left: `${x - radius}px`, top: `${y - radius}px`,
  });

  const grownAt = performance.now();
  requestAnimationFrame(() => wave.classList.add('is-grown'));

  const release = () => {
    host.removeEventListener('pointerup', release);
    host.removeEventListener('pointercancel', release);
    host.removeEventListener('pointerleave', release);
    // let a quick tap still show most of the wave before it fades
    const wait = reducedMotion.matches ? 0 : Math.max(0, 150 - (performance.now() - grownAt));
    setTimeout(() => {
      wave.classList.add('is-done');
      setTimeout(() => clip.remove(), 200);
    }, wait);
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('pointerleave', release);
}

export function initRipples() {
  document.addEventListener('pointerdown', startRipple);
}
