import { state } from './state.js';
import { loadObjects, saveObjects, writePhoto, nextNo } from './storage.js';
import { fmtStored } from './format.js';
import { copy } from './copy.js';
import { showOverlay, hideOverlay, hideAll } from './overlays.js';
import { renderGrid } from './grid.js';
import { showSnackbar } from './snackbar.js';
import { replay, reducedMotion } from './motion.js';
import { tapLight } from './haptics.js';
import { resetCity, currentCity } from './city.js';

/* ════════════════════════════════════════════════
   STEP 3 — REVIEW
   The cut-out lifts off the page (css #review-img.is-revealing) with a light tap.
════════════════════════════════════════════════ */
const img = document.getElementById('review-img');
const backdrop = document.getElementById('review-backdrop');
const clearBackdrop = () => { backdrop.classList.remove('is-fading'); backdrop.style.removeProperty('background-image'); };
backdrop.addEventListener('animationend', clearBackdrop); // frees the photo once it has faded
backdrop.addEventListener('animationcancel', clearBackdrop); // screen closed mid-fade
img.addEventListener('animationstart', e => { if (e.animationName === 'reveal-lift') tapLight(); });
// once revealed it's a plain sticker again (and a hidden screen never holds a half-done frame)
img.addEventListener('animationend', e => { if (e.animationName === 'reveal-outline') img.classList.remove('is-revealing'); });
img.addEventListener('animationcancel', () => img.classList.remove('is-revealing'));

// `original`: the photo before the cut-out (JPEG data URL), shown blurred behind
// the reveal; left out when the cut-out failed and the photo is the original.
// `fromCamera`: taken just now, so the city can fill itself in.
export function showReview(photo, original = null, { fromCamera = false } = {}) {
  state.pendingPhoto = photo;

  img.src = `data:${photo.mime};base64,${photo.base64}`;
  img.classList.toggle('sticker--photo', photo.mime === 'image/jpeg'); // a whole photo, not a cut-out
  document.getElementById('name-input').value = '';
  resetCity({ auto: fromCamera });

  hideOverlay('processing-overlay');
  showOverlay('review-overlay');
  replay(img, 'is-revealing');
  replay(img.parentElement, 'is-revealing'); // the hue and sparkles bloom in with it
  clearBackdrop();
  if (original && !reducedMotion()) {
    backdrop.style.backgroundImage = `url("${original}")`;
    replay(backdrop, 'is-fading');
  }
  // no auto-focus: naming is optional, so the keyboard waits for a tap
}

/* ════════════════════════════════════════════════
   STEP 4 — SAVE TO DEVICE
   Each object gets the next exhibit number, kept for good.
════════════════════════════════════════════════ */
export async function saveObject() {
  const name  = document.getElementById('name-input').value.trim(); // '' is fine: naming is optional
  const city  = currentCity();
  const photo = state.pendingPhoto;
  if (!photo) return;
  state.pendingPhoto = null; // guards against a double tap saving twice

  const id = Date.now();
  try {
    const file = await writePhoto(id, photo.base64, photo.mime);
    const list = loadObjects();
    await saveObjects([...list, { id, no: nextNo(list), name, date: fmtStored(new Date()), file, ...(city && { city }) }]);
  } catch (err) {
    console.error('[storage]', err);
    state.pendingPhoto = photo;
    showSnackbar(copy.toast.saveFailed);
    return;
  }

  state.justSaved = id; // the grid drops it in
  hideAll();
  await renderGrid();
  showSnackbar(copy.toast.added);
}
