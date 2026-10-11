/* ════════════════════════════════════════════════
   MOTION HELPERS
   The keyframes live in css/app.css (reveal, drop); this only (re)starts them.
════════════════════════════════════════════════ */
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Runs a CSS animation class again from the start, even if it is already set
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // flush, so re-adding the class restarts the animation
  el.classList.add(cls);
}
