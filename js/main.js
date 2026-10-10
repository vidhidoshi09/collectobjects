import { App, isNative } from './platform.js';
import { initStorage, loadMemories } from './storage.js';
import { hideOverlay, hideAll } from './overlays.js';
import { renderGrid, updateOpenMemory, closeDetail, confirmDelete, deleteMemory } from './grid.js';
import { openCamera, stopCamera, onShutterPressed, onGalleryPicked } from './camera.js';
import { saveMemory } from './review.js';
import { initRipples } from './ripple.js';
import { showSnackbar } from './snackbar.js';
import { autoGrow } from './textfield.js';

initRipples();

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
document.getElementById('save-btn').addEventListener('click', saveMemory);

// Enter key in name field saves
document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); saveMemory(); }
});

// Detail view
document.getElementById('detail-close').addEventListener('click', closeDetail);
document.getElementById('detail-name').addEventListener('change', e => {
  const name = e.target.value.trim();
  if (name) updateOpenMemory({ name });
  else e.target.value = loadMemories().find(m => String(m.id) === document.getElementById('detail-delete').dataset.id)?.name || '';
});
document.getElementById('detail-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') e.target.blur();
});
document.getElementById('detail-note').addEventListener('input', e => autoGrow(e.target));
document.getElementById('detail-note').addEventListener('change', e => {
  updateOpenMemory({ note: e.target.value.trim() });
});
document.getElementById('detail-delete').addEventListener('click', async e => {
  const id = e.currentTarget.dataset.id;
  if (await confirmDelete()) deleteMemory(id);
});

// Escape closes everything
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { stopCamera(); hideAll(); }
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
    showSnackbar("Couldn't load your memories. Please restart the app.");
  });
