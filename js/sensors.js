import { Capacitor, Feel } from './platform.js';

/* ════════════════════════════════════════════════
   SENSORS — the phone's motion, the same shape on every platform
   iPhone: Core Motion through the Feel plugin (web-view motion events need a
   permission prompt there and never arrived). Android and the browser: the
   web view's deviceorientation + devicemotion events.
   onMotion(fn) → stop(); fn({ beta, gamma, ax, ay, az }): tilt in degrees,
   acceleration without gravity in m/s² (any of them may be missing).
════════════════════════════════════════════════ */
const listeners = new Set();
const emit = data => listeners.forEach(fn => fn(data));
const native = Capacitor.getPlatform() === 'ios';
let running = false, last = {}, nativeHandle = null;

const onOrientation = e => { last = { ...last, beta: e.beta, gamma: e.gamma }; emit(last); };
const onDeviceMotion = e => {
  const a = e.acceleration;
  if (a) { last = { ...last, ax: a.x, ay: a.y, az: a.z }; emit(last); }
};

async function start() {
  running = true;
  if (native) {
    nativeHandle = await Feel.addListener('motion', emit);
    Feel.startMotion().catch(() => {});
  } else {
    addEventListener('deviceorientation', onOrientation);
    addEventListener('devicemotion', onDeviceMotion);
  }
}
function stop() {
  running = false;
  if (native) {
    Feel.stopMotion().catch(() => {});
    nativeHandle?.remove();
    nativeHandle = null;
  } else {
    removeEventListener('deviceorientation', onOrientation);
    removeEventListener('devicemotion', onDeviceMotion);
  }
}

export function onMotion(fn) {
  listeners.add(fn);
  if (!running) start();
  return () => {
    listeners.delete(fn);
    if (!listeners.size && running) stop();
  };
}
