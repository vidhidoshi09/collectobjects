import { App, isNative } from './platform.js';
import { initStorage, loadObjects } from './storage.js';
import { hideOverlay, hideAll } from './overlays.js';
import { renderGrid, updateOpenObject, closeDetail, confirmDelete, deleteObject, toggleDetailMenu, isDetailMenuOpen } from './grid.js';
import { openCamera, stopCamera, onShutterPressed, onGalleryPicked } from './camera.js';
import { saveObject } from './review.js';
import { showSnackbar } from './snackbar.js';
import { greetOncePerDay } from './greeting.js';
import { autoGrow } from './textfield.js';
import { copy, applyCopy } from './copy.js';

applyCopy(); // fills the static markup's words

/* ════════════════════════════════════════════════
   EVENTS
════════════════════════════════════════════════ */
// the add tile (first in the grid, also on the empty screen) opens the camera
document.getElementById('grid').addEventListener('click', e => {
  if (e.target.closest('#add-tile')) openCamera();
});
document.getElementById('camera-close').addEventListener('click', () => { stopCamera(); hideAll(); });
document.getElementById('shutter-btn').addEventListener('click', onShutterPressed);
document.getElementById('gallery-btn').addEventListener('click', () => document.getElementById('gallery-input').click());
document.getElementById('gallery-input').addEventListener('change', e => {
  const file = e.target.files[0];
  e.target.value = ''; // allow picking the same photo again
  if (file) onGalleryPicked(file);
});
document.getElementById('review-close').addEventListener('click', hideAll);

// Retake: go back to camera
document.getElementById('retake-btn').addEventListener('click', () => {
  hideOverlay('review-overlay');
  openCamera();
});

// Save
document.getElementById('save-btn').addEventListener('click', saveObject);

// Enter in the name field moves on to the story (it stays optional)
document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('story-input').focus(); }
});
document.getElementById('story-input').addEventListener('input', e => autoGrow(e.target));

// Detail view
document.getElementById('detail-close').addEventListener('click', closeDetail);
document.getElementById('detail-name').addEventListener('change', e => {
  const name = e.target.value.trim();
  if (name) updateOpenObject({ name });
  else e.target.value = loadObjects().find(m => String(m.id) === document.getElementById('detail-delete').dataset.id)?.name || '';
});
document.getElementById('detail-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') e.target.blur();
});
document.getElementById('detail-note').addEventListener('input', e => autoGrow(e.target));
document.getElementById('detail-note').addEventListener('change', e => {
  updateOpenObject({ note: e.target.value.trim() });
});
// ⋯ opens the menu; a tap anywhere else closes it
document.getElementById('detail-more').addEventListener('click', e => {
  e.stopPropagation();
  toggleDetailMenu();
});
document.addEventListener('click', e => {
  if (isDetailMenuOpen() && !e.target.closest('#detail-menu')) toggleDetailMenu(false);
});
document.getElementById('detail-delete').addEventListener('click', async e => {
  const id = e.currentTarget.dataset.id;
  toggleDetailMenu(false);
  if (await confirmDelete()) deleteObject(id);
});

// Escape closes everything (the detail view through closeDetail, which stops the tilt)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (isDetailMenuOpen()) return toggleDetailMenu(false, { refocus: true });
  if (document.getElementById('detail-overlay').classList.contains('active')) closeDetail();
  stopCamera();
  hideAll();
});

// Android hardware back button
if (isNative) {
  App.addListener('backButton', () => {
    const isActive = id => document.getElementById(id).classList.contains('active');
    if (isActive('processing-overlay')) return; // let background removal finish
    if (isDetailMenuOpen()) return toggleDetailMenu(false);
    if (isActive('review-overlay'))  return document.getElementById('review-close').click();
    if (isActive('camera-overlay'))  return document.getElementById('camera-close').click();
    if (isActive('detail-overlay'))  return document.getElementById('detail-close').click();
    App.exitApp();
  });
}


/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
initStorage()
  .then(renderGrid)
  .then(() => greetOncePerDay())
  .catch(err => {
    console.error('[storage]', err);
    showSnackbar(copy.toast.loadFailed);
  });
