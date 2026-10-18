import { reducedMotion } from './motion.js';
import { onMotion } from './sensors.js';

/* ════════════════════════════════════════════════
   HOLOGRAPHIC TILT — detail view (2.5D)
   The cut-out tilts with the phone (js/sensors.js: Core Motion on iPhone) or, on a desktop,
   follows the pointer. A sheen clipped to the object's shape slides across
   it (css: .tilt, .sheen). Smoothed every frame; nothing runs with
   reduce motion on. startTilt() returns stop(), which removes every listener.
════════════════════════════════════════════════ */
const MAX_DEG   = 12;   // furthest the object turns, either way
const GAIN      = 0.8;  // object degrees per degree the phone turns
const LERP      = 0.12; // share of the remaining distance covered each frame
const RECENTER  = 0.002; // per reading (~60/s): "straight ahead" drifts to a new grip over several seconds

const clamp = v => Math.max(-MAX_DEG, Math.min(MAX_DEG, v));

export function startTilt(el) {
  if (reducedMotion()) return () => {};

  let target = { x: 0, y: 0 }, now = { x: 0, y: 0 }, base = null, frame = 0;

  // Phone: the angle it is first held at is "straight ahead"
  const onOrientation = e => {
    if (e.beta == null || e.gamma == null) return;
    base ??= { beta: e.beta, gamma: e.gamma };
    base.beta  += (e.beta  - base.beta)  * RECENTER;
    base.gamma += (e.gamma - base.gamma) * RECENTER;
    target = { x: clamp((base.beta - e.beta) * GAIN), y: clamp((e.gamma - base.gamma) * GAIN) };
  };

  // Desktop: the object turns toward the pointer
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onPointer = e => {
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
    target = { x: clamp(-ny * MAX_DEG), y: clamp(nx * MAX_DEG) };
  };
  const onLeave = () => { target = { x: 0, y: 0 }; };

  const step = () => {
    now = { x: now.x + (target.x - now.x) * LERP, y: now.y + (target.y - now.y) * LERP };
    el.style.transform = `rotateX(${now.x.toFixed(2)}deg) rotateY(${now.y.toFixed(2)}deg)`;
    el.style.setProperty('--tilt-x', (now.y / MAX_DEG).toFixed(3)); // -1…1, sheen position
    el.style.setProperty('--tilt-y', (now.x / MAX_DEG).toFixed(3));
    frame = requestAnimationFrame(step);
  };

  const stopMotion = onMotion(onOrientation);
  if (finePointer) {
    addEventListener('pointermove', onPointer);
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
  frame = requestAnimationFrame(step);

  return function stop() {
    stopMotion();
    removeEventListener('pointermove', onPointer);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    cancelAnimationFrame(frame);
    el.style.removeProperty('transform');
    el.style.removeProperty('--tilt-x');
    el.style.removeProperty('--tilt-y');
  };
}
