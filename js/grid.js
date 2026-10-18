import { loadObjects, saveObjects, deletePhoto, photoSrc } from './storage.js';
import { esc } from './format.js';
import { copy } from './copy.js';
import { state } from './state.js';
import { showOverlay, hideOverlay } from './overlays.js';
import { NativeUi, isNative } from './platform.js';
import { showSnackbar } from './snackbar.js';
import { autoGrow } from './textfield.js';
import { success, tapLight, warning } from './haptics.js';
import { fly, poof } from './flight.js';
import { startTilt } from './tilt.js';
import { replay } from './motion.js';

/* ════════════════════════════════════════════════
   RENDER GRID
   Newest first, just the objects: no name or date under them, so the objects shine
   (both open in the close-up). Capture in the tab bar adds one; the empty screen
   keeps its own add tile. A just-saved object drops into place (css .card--dropped).
════════════════════════════════════════════════ */
// The name as the person wrote it; '' when they skipped it (older saves stored "untitled object")
export const nameOf = m => (m.name && m.name !== copy.item.untitled ? m.name : '');

// `enter`: the first render after launch, when the objects rise in one after another
export async function renderGrid({ enter = false } = {}) {
  const objects = loadObjects().slice().reverse();
  const srcs = await Promise.all(objects.map(photoSrc));
  const grid = document.getElementById('grid');

  document.getElementById('header-count').textContent = copy.home.count(objects.length);

  document.body.classList.toggle('is-empty', objects.length === 0);
  if (objects.length === 0) {
    // the invitation, ending in the same add tile
    grid.innerHTML = `
      <div class="empty">
        <div class="empty__samples" aria-hidden="true">
          <img class="sticker" src="assets/croissant.png" alt="" />
          <img class="sticker" src="assets/teapot.png" alt="" />
          <img class="sticker" src="assets/duck.png" alt="" />
        </div>
        <p class="empty__title">${esc(copy.empty.title)}</p>
        <p class="empty__sub">${esc(copy.empty.body)}</p>
        <button class="add-tile add-tile--solo" id="add-tile" type="button" aria-label="${esc(copy.home.add)}">
          <svg class="icon" aria-hidden="true"><use href="#i-add"/></svg>
        </button>
      </div>`;
    return;
  }

  const dropped = state.justSaved;
  state.justSaved = null;
  grid.innerHTML = objects.map((m, i) => `
    <div class="card${m.id === dropped ? ' card--dropped' : ''}${enter ? ' card--enter' : ''}" style="--i: ${Math.min(i, 12)}" role="button" tabindex="0"
         aria-label="${esc(`${nameOf(m) || copy.item.untitled}, ${copy.item.date(m.date)}`)}" data-id="${m.id}" data-no="${m.no}">
      <div class="card__img-wrap">
        <img class="sticker${m.file?.endsWith('.jpg') ? ' sticker--photo' : ''}" src="${srcs[i]}" alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  `).join('');

  // Tap card (or Enter / Space on it) → detail view
  grid.querySelectorAll('.card[data-id]').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(card.dataset.id); }
    });
  });
  // the success haptic lands with the drop
  grid.querySelector('.card--dropped')?.addEventListener('animationstart', success, { once: true });
}

/* ════════════════════════════════════════════════
   DETAIL VIEW — floating cut-out (tilts), name, date, story
════════════════════════════════════════════════ */
let stopTilt = () => {};

const tileImg = id => document.querySelector(`#grid .card[data-id="${id}"] img`);

async function openDetail(id) {
  const m = loadObjects().find(x => String(x.id) === String(id));
  if (!m) return;
  tapLight();

  const src = await photoSrc(m);
  const img = document.getElementById('detail-img');
  img.src = src;
  await img.decode().catch(() => {}); // ready before it flies
  document.getElementById('detail-img').alt = nameOf(m) || copy.item.untitled;
  document.getElementById('detail-img').classList.toggle('sticker--photo', Boolean(m.file?.endsWith('.jpg')));
  // absolute, so a bundled sample's relative path isn't read from css/ (where the variable is used)
  document.getElementById('detail-sheen').style.setProperty('--sheen-mask', `url("${new URL(src, location.href).href}")`);
  document.getElementById('detail-name').value = nameOf(m);
  document.getElementById('detail-note').value = m.note || '';
  document.getElementById('detail-meta').textContent = copy.item.dateLine(m.date, m.city);
  document.getElementById('detail-delete').dataset.id = m.id;

  // the object flies from its tile into the close-up; the glow blooms in behind it
  const tile = tileImg(m.id);
  const from = tile?.getBoundingClientRect();
  img.style.visibility = 'hidden';
  if (tile) tile.style.visibility = 'hidden';
  showOverlay('detail-overlay');
  autoGrow(document.getElementById('detail-note'));
  replay(document.querySelector('.detail-img-wrap'), 'is-opening');
  stopTilt();
  await fly(img, from, img, { opening: true });
  img.style.visibility = '';
  if (tile) tile.style.visibility = '';
  stopTilt = startTilt(document.getElementById('detail-tilt'));
}

// Saves an edited name or story for the object open in the detail view
export async function updateOpenObject(changes) {
  const id = document.getElementById('detail-delete').dataset.id;
  const updated = loadObjects().map(m => String(m.id) === String(id) ? { ...m, ...changes } : m);
  try {
    await saveObjects(updated);
  } catch (err) {
    console.error('[storage]', err);
    showSnackbar(copy.toast.saveFailed);
    return;
  }
  renderGrid();
}

// The ⋯ menu (delete lives here, not one stray tap away)
const menu = document.getElementById('detail-menu');
const moreBtn = document.getElementById('detail-more');
export const isDetailMenuOpen = () => !menu.hidden;
export function toggleDetailMenu(open = menu.hidden, { refocus = false } = {}) {
  menu.hidden = !open;
  moreBtn.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('[role="menuitem"]').focus();
  else if (refocus) moreBtn.focus();
}

// `flyBack`: the object flies home to its tile (not after a delete: it's gone)
export async function closeDetail({ flyBack = true } = {}) {
  toggleDetailMenu(false);
  document.activeElement?.blur(); // commits an in-progress name/story edit
  stopTilt();
  stopTilt = () => {};
  const img = document.getElementById('detail-img');
  const tile = flyBack ? tileImg(document.getElementById('detail-delete').dataset.id) : null;
  const from = img.getBoundingClientRect();
  if (tile && img.src) img.style.visibility = 'hidden'; // only the flyer travels home
  hideOverlay('detail-overlay');
  if (tile && img.src) {
    const to = tile.getBoundingClientRect();
    const onScreen = to.bottom > 0 && to.top < innerHeight;
    if (onScreen) {
      tile.style.visibility = 'hidden';
      // flies from the close-up's box to the tile's (fly() moves "from → to", so run it closing)
      await fly(img, to, flyerTarget(from), { opening: false });
      tile.style.visibility = '';
    }
  }
  img.src = '';
  img.style.removeProperty('visibility');
  img.style.removeProperty('opacity'); img.style.removeProperty('transform'); img.style.removeProperty('filter');
  document.getElementById('detail-sheen').style.removeProperty('--sheen-mask');
}

// fly() measures its target element; on close the close-up is fading out, so give it the box it had
const flyerTarget = rect => ({ getBoundingClientRect: () => rect });

// Native Material 3 dialog on Android; plain confirm() in a desktop browser
export async function confirmDelete() {
  const { title, body: message, confirm: confirmLabel, cancel: cancelLabel } = copy.delete;
  if (!isNative) return confirm(`${title}\n\n${message}`);

  const { confirmed } = await NativeUi.confirm({
    title, message, confirmLabel, cancelLabel, destructive: true,
  });
  return confirmed;
}

// Removing never renumbers: the other objects keep their exhibit numbers
export async function deleteObject(id) {
  const removed = loadObjects().find(m => String(m.id) === String(id));
  try {
    await saveObjects(loadObjects().filter(m => m !== removed));
  } catch (err) {
    console.error('[storage]', err);
    showSnackbar(copy.toast.saveFailed);
    return;
  }
  if (removed?.file) await deletePhoto(removed.file);
  warning();
  await poof(document.getElementById('detail-img')); // the object shrinks away
  closeDetail({ flyBack: false });
  await renderGrid();
  showSnackbar(copy.toast.deleted);
}
