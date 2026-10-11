import { Capacitor, Filesystem, Directory, Encoding, isNative } from './platform.js';
import { state } from './state.js';

/* ════════════════════════════════════════════════
   STORAGE — app's private files on the device
   objects.json holds the list; objects/<id>.png holds each cut-out.
   Record: { id, no, name, date, file, note? }
   (In a desktop browser, Capacitor keeps these in IndexedDB instead.)
   Data from earlier versions is moved in once: memories.json + photos/
   (before the rename), and base64 images in localStorage (before files).
════════════════════════════════════════════════ */
const INDEX_FILE  = 'objects.json';
const PHOTO_DIR   = 'objects';
const OLD_INDEX_FILE = 'memories.json';       // before the rename, moved once
const OLD_PHOTO_DIR  = 'photos';
const LEGACY_KEY  = 'memories_collection'; // old localStorage storage, migrated once

const photoSrcCache = new Map(); // file path → displayable URL

export function loadObjects() {
  return state.objects;
}

/* ════════════════════════════════════════════════
   EXHIBIT NUMBERS
   Every object keeps a permanent number `no` (no. 001, no. 002 …), given at
   save as the highest number so far + 1. Deleting never renumbers.
════════════════════════════════════════════════ */
export const nextNo = list => list.reduce((max, m) => Math.max(max, m.no || 0), 0) + 1;

// Records saved before numbers existed get them once, oldest (lowest id) first.
// Returns the list with numbers, or null when nothing needed one.
export function numberUnnumbered(list) {
  if (list.every(m => Number.isInteger(m.no))) return null;
  let no = nextNo(list);
  const order = list.filter(m => !Number.isInteger(m.no)).sort((a, b) => Number(a.id) - Number(b.id));
  const numbers = new Map(order.map(m => [m, no++]));
  return list.map(m => (numbers.has(m) ? { ...m, no: numbers.get(m) } : m));
}

export async function saveObjects(arr) {
  await Filesystem.writeFile({
    path: INDEX_FILE, directory: Directory.Data, encoding: Encoding.UTF8,
    data: JSON.stringify(arr),
  });
  state.objects = arr;
}

async function readIndexFile(path = INDEX_FILE) {
  try {
    await Filesystem.stat({ path, directory: Directory.Data });
  } catch {
    return null; // first launch
  }
  const { data } = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
  return JSON.parse(data);
}

export async function writePhoto(id, base64, mime) {
  const path = `${PHOTO_DIR}/${id}.${mime === 'image/jpeg' ? 'jpg' : 'png'}`;
  await Filesystem.writeFile({ path, data: base64, directory: Directory.Data, recursive: true });
  return path;
}

export async function deletePhoto(path) {
  photoSrcCache.delete(path);
  try { await Filesystem.deleteFile({ path, directory: Directory.Data }); }
  catch (e) { console.warn('[storage] could not delete', path, e); }
}

// Bundled samples have `image` (an asset path); captured objects have `file`.
export async function photoSrc(m) {
  if (!m.file) return m.image;
  if (photoSrcCache.has(m.file)) return photoSrcCache.get(m.file);

  let src;
  if (isNative) {
    const { uri } = await Filesystem.getUri({ path: m.file, directory: Directory.Data });
    src = Capacitor.convertFileSrc(uri);
  } else {
    const { data } = await Filesystem.readFile({ path: m.file, directory: Directory.Data });
    const mime = m.file.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
    src = data instanceof Blob ? URL.createObjectURL(data) : `data:${mime};base64,${data}`;
  }
  photoSrcCache.set(m.file, src);
  return src;
}

// Moves objects saved by the first versions (base64 images in localStorage) into files.
async function migrateLegacy() {
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); }
  catch { legacy = null; }
  if (!Array.isArray(legacy) || legacy.length === 0) return null;

  const migrated = [];
  for (const m of legacy) {
    const match = /^data:(image\/[a-z]+);base64,(.*)$/.exec(m.image || '');
    if (match) {
      const file = await writePhoto(m.id, match[2], match[1]);
      migrated.push({ id: m.id, name: m.name, date: m.date, file });
    } else {
      migrated.push(m);
    }
  }
  return migrated;
}

// Moves memories.json + photos/ (saved before the rename) to objects.json + objects/.
// Photos are copied first and the old files removed only after the new index
// is written, so an interruption never loses anything; it just runs again.
async function migrateRenamed() {
  const old = await readIndexFile(OLD_INDEX_FILE);
  if (!old) return null;

  try { await Filesystem.mkdir({ path: PHOTO_DIR, directory: Directory.Data, recursive: true }); }
  catch { /* already there */ }
  const moved = [];
  for (const m of old) {
    if (!m.file?.startsWith(`${OLD_PHOTO_DIR}/`)) { moved.push(m); continue; }
    const file = `${PHOTO_DIR}/${m.file.slice(OLD_PHOTO_DIR.length + 1)}`;
    try {
      await Filesystem.copy({ from: m.file, to: file, directory: Directory.Data });
      moved.push({ ...m, file });
    } catch (e) {
      console.warn('[storage] could not move', m.file, e);
      moved.push(m); // keeps pointing at the old file, which then stays
    }
  }
  await saveObjects(numberUnnumbered(moved) || moved);

  await Filesystem.deleteFile({ path: OLD_INDEX_FILE, directory: Directory.Data }).catch(() => {});
  for (const m of moved.filter(m => m.file?.startsWith(`${PHOTO_DIR}/`))) {
    const was = old.find(o => o.id === m.id)?.file;
    if (was && was !== m.file) await Filesystem.deleteFile({ path: was, directory: Directory.Data }).catch(() => {});
  }
  if (moved.every(m => !m.file?.startsWith(`${OLD_PHOTO_DIR}/`))) {
    await Filesystem.rmdir({ path: OLD_PHOTO_DIR, directory: Directory.Data, recursive: true }).catch(() => {});
  }
  return moved;
}

/* ════════════════════════════════════════════════
   FIRST LAUNCH
   New installs start empty. Bundled samples (assets/) only remain for
   people who had them before.
════════════════════════════════════════════════ */

export async function initStorage() {
  const existing = await readIndexFile();
  if (existing) {
    const numbered = numberUnnumbered(existing);
    if (numbered) await saveObjects(numbered); // saved once; numbers never change after
    else state.objects = existing;
    return;
  }
  if (await migrateRenamed()) return;
  const migrated = await migrateLegacy();
  await saveObjects(migrated ? numberUnnumbered(migrated) || migrated : []); // new installs start empty
  if (migrated) localStorage.removeItem(LEGACY_KEY);
}
