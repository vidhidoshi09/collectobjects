import { App, isNative } from './platform.js';
import { initStorage, loadObjects } from './storage.js';
import { hideOverlay, hideAll } from './overlays.js';
import { renderGrid, updateOpenObject, closeDetail, confirmDelete, deleteObject } from './grid.js';
import { openCamera, stopCamera, onShutterPressed, onGalleryPicked } from './camera.js';
import { saveObject } from './review.js';
import { showSnackbar } from './snackbar.js';
import { autoGrow } from './textfield.js';
import { copy, applyCopy } from './copy.js';

applyCopy(); // fills the static markup's words

/* ════════════════════════════════════════════════
   EVENTS
════════════════════════════════════════════════ */
document.getElementById('fab').addEventListener('click', openCamera);
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

// Enter key in name field saves
document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); saveObject(); }
});

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
document.getElementById('detail-delete').addEventListener('click', async e => {
  const id = e.currentTarget.dataset.id;
  if (await confirmDelete()) deleteObject(id);
});

// Escape closes everything (the detail view through closeDetail, which stops the tilt)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('detail-overlay').classList.contains('active')) closeDetail();
  stopCamera();
  hideAll();
});

// Android hardware back button
if (isNative) {
  App.addListener('backButton', () => {
    const isActive = id => document.getElementById(id).classList.contains('active');
    if (isActive('processing-overlay')) return; // let background removal finish
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
  .catch(err => {
    console.error('[storage]', err);
    showSnackbar(copy.toast.loadFailed);
  });
