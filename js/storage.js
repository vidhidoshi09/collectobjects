import { Capacitor, Filesystem, Directory, Encoding, isNative } from './platform.js';
import { state } from './state.js';

/* ════════════════════════════════════════════════
   STORAGE — app's private files on the device
   memories.json holds the list; photos/<id>.png holds each cut-out.
   (In a desktop browser, Capacitor keeps these in IndexedDB instead.)
════════════════════════════════════════════════ */
const INDEX_FILE  = 'memories.json';
const PHOTO_DIR   = 'photos';
const LEGACY_KEY  = 'memories_collection'; // old localStorage storage, migrated once

const photoSrcCache = new Map(); // file path → displayable URL

export function loadMemories() {
  return state.memories;
}

export async function saveMemories(arr) {
  await Filesystem.writeFile({
    path: INDEX_FILE, directory: Directory.Data, encoding: Encoding.UTF8,
    data: JSON.stringify(arr),
  });
  state.memories = arr;
}

async function readIndexFile() {
  try {
    await Filesystem.stat({ path: INDEX_FILE, directory: Directory.Data });
  } catch {
    return null; // first launch
  }
  const { data } = await Filesystem.readFile({ path: INDEX_FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
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

// Bundled samples have `image` (an asset path); captured memories have `file`.
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

// Moves memories saved by older versions (base64 images in localStorage) into files.
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

/* ════════════════════════════════════════════════
   FIRST LAUNCH
   New installs start empty. Bundled samples (assets/) only remain for
   people who had them before.
════════════════════════════════════════════════ */

export async function initStorage() {
  const existing = await readIndexFile();
  if (existing) {
    state.memories = existing;
    return;
  }
  const migrated = await migrateLegacy();
  await saveMemories(migrated || []); // new installs start empty
  if (migrated) localStorage.removeItem(LEGACY_KEY);
}
