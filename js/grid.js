import { loadObjects, saveObjects, deletePhoto, photoSrc } from './storage.js';
import { esc } from './format.js';
import { copy } from './copy.js';
import { state } from './state.js';
import { showOverlay, hideOverlay } from './overlays.js';
import { NativeUi, isNative } from './platform.js';
import { showSnackbar } from './snackbar.js';
import { success, tapLight, warning } from './haptics.js';
import { fly, poof } from './flight.js';
import { startTilt } from './tilt.js';
import { replay, reducedMotion } from './motion.js';
import { createCarousel } from './carousel.js';

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
   DETAIL VIEW — the close-up: a carousel of the whole collection (js/carousel.js)
   Opening: the other tiles scatter outward and fade, the tapped object flies
   into the middle (js/flight.js) and the name rises in. Swiping to another
   object ticks (haptic) and swaps the name and date. Closing flies the object
   in the middle home to its tile and the others gather back.
════════════════════════════════════════════════ */
let stopTilt = () => {};
let scattered = []; // the grid tiles' scatter animations, reversed on close
let order = [];     // ids in grid order (newest first), one slide each

const tileImg = id => document.querySelector(`#grid .card[data-id="${id}"] img`);
const openId = () => document.getElementById('detail-delete').dataset.id;
const objectById = id => loadObjects().find(x => String(x.id) === String(id));

const carousel = createCarousel(document.getElementById('carousel'), document.getElementById('carousel-track'), {
  onChange: i => { tapLight(); showObject(order[i], { swap: true }); },
});

// Name, date (and city) of the object in the middle, and its tilt
function showObject(id, { swap = false } = {}) {
  const m = objectById(id);
  if (!m) return;
  const name = document.getElementById('detail-name');
  if (document.activeElement === name) name.blur(); // commits an edit to the previous object
  name.value = nameOf(m);
  document.getElementById('detail-meta').textContent = copy.item.dateLine(m.date, m.city);
  document.getElementById('detail-delete').dataset.id = m.id;
  if (swap) {
    replay(document.getElementById('detail-head'), 'is-swapping');
    replay(document.getElementById('carousel'), 'is-swapping'); // sparkles pop again
  }
  stopTilt();
  const tilt = carousel.active()?.querySelector('.tilt');
  stopTilt = tilt ? startTilt(tilt) : () => {};
}

// Other tiles on screen push away from the tapped one and fade (the reference transition)
function scatter(fromTile) {
  if (reducedMotion() || !fromTile) return;
  const c = fromTile.getBoundingClientRect();
  const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  scattered = [...document.querySelectorAll('#grid .card')].filter(card => {
    const r = card.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && !card.contains(fromTile);
  }).map(card => {
    const r = card.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
    const len = Math.hypot(dx, dy) || 1;
    return card.animate(
      [{ transform: 'none', opacity: 1, filter: 'blur(0)' },
       { transform: `translate(${(dx / len) * 56}px, ${(dy / len) * 56}px) scale(0.9)`, opacity: 0, filter: 'blur(4px)' }],
      { duration: 340, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  });
}
function gather() {
  const anims = scattered;
  scattered = [];
  anims.forEach(a => { a.reverse(); a.finished.then(() => a.cancel(), () => {}); });
}

async function openDetail(id) {
  const objects = loadObjects().slice().reverse();
  order = objects.map(m => String(m.id));
  const at = order.indexOf(String(id));
  if (at < 0) return;
  tapLight();

  const srcs = await Promise.all(objects.map(photoSrc));
  carousel.set(objects.map((m, i) => `
    <div class="slide__wrap">
      <div class="tilt">
        <img class="sticker${m.file?.endsWith('.jpg') ? ' sticker--photo' : ''}" src="${srcs[i]}" alt="${esc(nameOf(m) || copy.item.untitled)}" decoding="async" />
        <div class="sheen" aria-hidden="true" style="--sheen-mask: url(&quot;${esc(new URL(srcs[i], location.href).href)}&quot;)"></div>
      </div>
    </div>`), at);

  const tile = tileImg(id);
  const from = tile?.getBoundingClientRect();
  if (tile) tile.style.visibility = 'hidden';
  scatter(tile);
  showOverlay('detail-overlay');
  carousel.measure(); // sizes are known once the screen is shown
  showObject(id);
  const img = carousel.active().querySelector('img');
  await img.decode().catch(() => {});
  img.style.visibility = 'hidden';
  replay(document.getElementById('detail-overlay'), 'is-opening'); // the glow blooms, the name rises in
  await fly(img, from, img, { opening: true });
  img.style.visibility = '';
  if (tile) tile.style.visibility = '';
}

// Saves an edited name for the object in the middle of the close-up
export async function updateOpenObject(changes) {
  const id = openId();
  const updated = loadObjects().map(m => String(m.id) === String(id) ? { ...m, ...changes } : m);
  try {
    await saveObjects(updated);
  } catch (err) {
    console.error('[storage]', err);
    showSnackbar(copy.toast.saveFailed);
    return;
  }
  const img = carousel.active()?.querySelector('img');
  if (img) img.alt = changes.name || copy.item.untitled;
}

// `flyBack`: the object in the middle flies home to its tile (not after a delete: it's gone)
export async function closeDetail({ flyBack = true } = {}) {
  document.activeElement?.blur(); // commits an in-progress name edit
  stopTilt();
  stopTilt = () => {};
  const img = carousel.active()?.querySelector('img');
  const id = openId();
  // after swiping, the object in the middle may be far down the grid: bring its tile into view first
  let tile = flyBack ? tileImg(id) : null;
  if (tile) {
    const r = tile.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) tile.scrollIntoView({ block: 'center' });
  }
  const from = img?.getBoundingClientRect();
  if (tile && img) img.style.visibility = 'hidden'; // only the flyer travels home
  hideOverlay('detail-overlay');
  gather();
  if (tile && img && from) {
    tile.style.visibility = 'hidden';
    await fly(img, tile.getBoundingClientRect(), { getBoundingClientRect: () => from }, { opening: false });
    tile.style.visibility = '';
  }
  await renderGrid(); // picks up renamed objects
}

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
  const img = carousel.active()?.querySelector('img');
  if (img) await poof(img); // the object shrinks away
  scattered = []; // the grid redraws without it
  await closeDetail({ flyBack: false });
  showSnackbar(copy.toast.deleted);
}
