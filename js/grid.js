import { loadMemories, saveMemories, deletePhoto, photoSrc } from './storage.js';
import { fmtShort, esc } from './format.js';
import { showOverlay, hideOverlay } from './overlays.js';

/* ════════════════════════════════════════════════
   RENDER GRID
════════════════════════════════════════════════ */
export async function renderGrid() {
  const memories = loadMemories().slice().reverse();
  const srcs = await Promise.all(memories.map(photoSrc));
  const grid = document.getElementById('grid');

  document.getElementById('header-date').textContent  = fmtShort(new Date());
  document.getElementById('header-count').textContent =
    `${memories.length} object${memories.length !== 1 ? 's' : ''} collected`;

  document.body.classList.toggle('is-empty', memories.length === 0);
  if (memories.length === 0) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="empty__samples" aria-hidden="true">
          <img src="assets/croissant.png" alt="" />
          <img src="assets/teapot.png" alt="" />
          <img src="assets/duck.png" alt="" />
        </div>
        <p class="empty__title">Keep the little things</p>
        <p class="empty__sub">Snap an object that matters to you. We'll cut it out and keep it in your collection.</p>
        <button class="empty__cta" id="empty-cta" type="button">
          <svg class="icon" aria-hidden="true"><use href="#i-photo-camera"/></svg>
          Create now
        </button>
      </div>`;
    document.getElementById('empty-cta').addEventListener('click', () => document.getElementById('fab').click());
    return;
  }

  grid.innerHTML = memories.map((m, i) => `
    <div class="card" role="button" tabindex="0" aria-label="${esc(m.name)}" data-id="${m.id}">
      <div class="card__img-wrap">
        <img src="${srcs[i]}" alt="${esc(m.name)}" loading="lazy" decoding="async" />
      </div>
      <p class="card__name">${esc(m.name)}</p>
      <p class="card__date">${m.date}</p>
    </div>
  `).join('');

  // Tap card → detail view
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

/* ════════════════════════════════════════════════
   DETAIL VIEW
════════════════════════════════════════════════ */
async function openDetail(id) {
  const m = loadMemories().find(x => String(x.id) === String(id));
  if (!m) return;

  document.getElementById('detail-img').src   = await photoSrc(m);
  document.getElementById('detail-img').alt   = m.name;
  document.getElementById('detail-name').value = m.name;
  document.getElementById('detail-note').value = m.note || '';
  document.getElementById('detail-date').textContent = m.date;
  document.getElementById('detail-delete').dataset.id = m.id;

  showOverlay('detail-overlay');
}

// Saves an edited name or story for the memory open in the detail view
export async function updateOpenMemory(changes) {
  const id = document.getElementById('detail-delete').dataset.id;
  const updated = loadMemories().map(m => String(m.id) === String(id) ? { ...m, ...changes } : m);
  try {
    await saveMemories(updated);
  } catch (err) {
    console.error('[storage]', err);
    alert('Could not save your change. Please try again.');
    return;
  }
  renderGrid();
}

export function closeDetail() {
  document.activeElement?.blur(); // commits an in-progress name/story edit
  hideOverlay('detail-overlay');
  document.getElementById('fab').style.display = 'flex';
  document.getElementById('detail-img').src = '';
}

export async function deleteMemory(id) {
  const removed = loadMemories().find(m => String(m.id) === String(id));
  await saveMemories(loadMemories().filter(m => m !== removed));
  if (removed?.file) await deletePhoto(removed.file);
  closeDetail();
  renderGrid();
}
