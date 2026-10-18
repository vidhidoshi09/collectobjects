import { Haptics, Feel, isNative } from './platform.js';

/* ════════════════════════════════════════════════
   HAPTICS — a few small moments (design/foundations.md → Motion)
   Android and iPhone (Capacitor Haptics); the browser preview has none. A haptic never breaks a flow.
════════════════════════════════════════════════ */
function buzz(call) {
  if (!isNative) return;
  try { Promise.resolve(call()).catch(() => {}); } catch { /* no vibrator, plugin missing */ }
}

// The cut-out lifts off the page (review reveal), a tab, an object opening
export const tapLight = () => buzz(() => Haptics.impact({ style: 'LIGHT' }));
// Capture: the camera opens
export const tapMedium = () => buzz(() => Haptics.impact({ style: 'MEDIUM' }));
// An object is deleted
export const warning = () => buzz(() => Haptics.notification({ type: 'WARNING' }));
// A new object lands in the grid (save)
export const success  = () => buzz(() => Haptics.notification({ type: 'SUCCESS' }));

// Shake to tumble (js/tumble.js): Core Haptics on iPhone, amplitude on Android.
// A landing: `intensity` from how hard it hit, `sharpness` from the object's shape (thin = clicky, round = dull)
export const thud = (intensity, sharpness) => buzz(() => Feel.impact({ intensity, sharpness }));
// The shake that lets everything go
export const rumble = () => buzz(() => Feel.rumble({ intensity: 0.8, duration: 0.35 }));
