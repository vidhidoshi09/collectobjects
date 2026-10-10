import { state } from './state.js';
import { loadMemories, saveMemories, writePhoto } from './storage.js';
import { fmtFull } from './format.js';
import { showOverlay, hideOverlay, hideAll } from './overlays.js';
import { renderGrid } from './grid.js';

/* ════════════════════════════════════════════════
   STEP 3 — REVIEW
════════════════════════════════════════════════ */
export function showReview(photo) {
  state.pendingPhoto = photo;

  document.getElementById('review-img').src = `data:${photo.mime};base64,${photo.base64}`;
  document.getElementById('name-input').value = '';
  document.getElementById('name-input').placeholder = 'Name this object…';

  hideOverlay('processing-overlay');
  showOverlay('review-overlay');

  // Auto-focus name input after short delay
  setTimeout(() => document.getElementById('name-input').focus(), 300);
}

/* ════════════════════════════════════════════════
   STEP 4 — SAVE TO DEVICE
════════════════════════════════════════════════ */
export async function saveMemory() {
  const name  = document.getElementById('name-input').value.trim() || 'My Object';
  const photo = state.pendingPhoto;
  if (!photo) return;
  state.pendingPhoto = null; // guards against a double tap saving twice

  try {
    const id   = Date.now();
    const file = await writePhoto(id, photo.base64, photo.mime);
    await saveMemories([...loadMemories(), { id, name, date: fmtFull(new Date()), file }]);
  } catch (err) {
    console.error('[storage]', err);
    state.pendingPhoto = photo;
    alert('Could not save this memory. Please try again.');
    return;
  }

  hideAll();
  renderGrid();
}
