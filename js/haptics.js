import { Haptics, isNative } from './platform.js';

/* ════════════════════════════════════════════════
   HAPTICS — two moments only (design/foundations.md → Motion)
   Android only; the browser preview has none. A haptic never breaks a flow.
════════════════════════════════════════════════ */
function buzz(call) {
  if (!isNative) return;
  try { Promise.resolve(call()).catch(() => {}); } catch { /* no vibrator, plugin missing */ }
}

// The cut-out lifts off the page (review reveal)
export const tapLight = () => buzz(() => Haptics.impact({ style: 'LIGHT' }));
// A new object lands in the grid (save)
export const success  = () => buzz(() => Haptics.notification({ type: 'SUCCESS' }));
