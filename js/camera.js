import { state } from './state.js';
import { showOverlay, hideOverlay, hideAll } from './overlays.js';
import { progress, removeBackground } from './background.js';
import { showReview } from './review.js';
import { showSnackbar } from './snackbar.js';
import { copy } from './copy.js';

/* ════════════════════════════════════════════════
   STEP 1 — CAMERA
════════════════════════════════════════════════ */
export async function openCamera() {
  const video  = document.getElementById('camera-video');
  const denied = document.getElementById('cam-denied');

  showOverlay('camera-overlay');
  denied.classList.remove('visible');
  video.style.display = 'block';

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal:'environment' }, width:{ideal:1920}, height:{ideal:1920} },
      audio: false,
    });
    video.srcObject = state.stream;
    video.play().catch(() => {}); // Android WebView can wait for a gesture otherwise
    // Back camera → true orientation; front camera or laptop webcam (often unreported) → mirror
    state.mirrored = state.stream.getVideoTracks()[0]?.getSettings().facingMode !== 'environment';
    video.classList.toggle('mirrored', state.mirrored);
  } catch (err) {
    console.warn('[camera]', err.name);
    video.style.display = 'none';
    denied.classList.add('visible');
  }
}

export function stopCamera() {
  if (state.stream) { state.stream.getTracks().forEach(t => t.stop()); state.stream = null; }
  document.getElementById('camera-video').srcObject = null;
}

function captureFrame() {
  const video  = document.getElementById('camera-video');
  const canvas = document.getElementById('capture-canvas');
  const vw = video.videoWidth  || 1280;
  const vh = video.videoHeight || 1280;
  const side = Math.min(vw, vh);
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.save();
  if (state.mirrored) {
    // Match the mirrored preview
    ctx.scale(-1, 1);
    ctx.translate(-1024, 0);
  }
  ctx.drawImage(video, (vw-side)/2, (vh-side)/2, side, side, 0, 0, 1024, 1024);
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ════════════════════════════════════════════════
   FULL FLOW
════════════════════════════════════════════════ */
export async function onShutterPressed() {
  if (!state.stream) return;

  // 1. Capture frame from video
  const jpegDataURL = captureFrame();
  stopCamera();
  hideOverlay('camera-overlay');
  await processPhoto(jpegDataURL, { fromCamera: true });
}

// Gallery photo → JPEG data URL, longest side at most 1024px (like camera captures)
export async function onGalleryPicked(file) {
  stopCamera();
  hideOverlay('camera-overlay');

  let jpegDataURL;
  try {
    const bitmap = await createImageBitmap(file); // applies the photo's EXIF rotation
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.getElementById('capture-canvas');
    canvas.width  = Math.round(bitmap.width  * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // transparent areas would otherwise turn black in the JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    jpegDataURL = canvas.toDataURL('image/jpeg', 0.92);
  } catch (err) {
    console.error('[gallery]', err);
    hideAll();
    showSnackbar(copy.toast.photoUnreadable);
    return;
  }
  await processPhoto(jpegDataURL);
}

async function processPhoto(jpegDataURL, { fromCamera = false } = {}) {
  // 2. Show processing overlay with the progress ring
  progress.start();
  showOverlay('processing-overlay');

  try {
    // 3. Remove background on the device
    const photo = await removeBackground(jpegDataURL);
    progress.finish();
    await new Promise(r => setTimeout(r, 250)); // let 100% register

    // 4. Show review screen, the original photo blurred behind the reveal
    showReview(photo, jpegDataURL, { fromCamera });
  } catch (err) {
    progress.finish();
    console.error('[bg-removal]', err.message || err); // details stay in the log, not the UI
    // Fallback: keep the original photo
    showReview({ base64: jpegDataURL.split(',')[1], mime: 'image/jpeg' }, null, { fromCamera });
    showSnackbar(copy.toast.cutoutFailed);
  }
}
