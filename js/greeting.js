import { copy } from './copy.js';
import { showSnackbar } from './snackbar.js';

/* ════════════════════════════════════════════════
   DAILY GREETING
   A time-of-day toast on the first open of each day. Uses the phone's local
   clock only (no location). Remembered per device; if storage is unavailable
   the greeting simply shows again, which is harmless.
════════════════════════════════════════════════ */
const KEY = 'greeted-on';
const today = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export function greetOncePerDay(now = new Date()) {
  let last = null;
  try { last = localStorage.getItem(KEY); } catch {}
  if (last === today(now)) return;
  try { localStorage.setItem(KEY, today(now)); } catch {}
  showSnackbar(copy.greeting(now.getHours()));
}
