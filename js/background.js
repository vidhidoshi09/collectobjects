import { BackgroundRemover, isNative } from './platform.js';
import { copy } from './copy.js';

/* ════════════════════════════════════════════════
   STEP 2 — BACKGROUND REMOVAL, on the device
   Android: ML Kit via BackgroundRemoverPlugin. Returns { base64, mime }.
   Desktop browser preview: no on-device model, so the photo is kept as is.
════════════════════════════════════════════════ */
const BG_TIMEOUT_MS = 90_000;

/* Orange progress ring on the processing screen, percentage in the middle.
   ML Kit reports no progress while cutting, so that phase shows an estimate
   that eases toward 95% and completes when the result arrives. The one-time
   model download reports real progress. */
export const progress = (() => {
  const RING  = 2 * Math.PI * 44; // circumference of the r=44 circle
  const ring  = document.getElementById('progress');
  const bar   = document.getElementById('progress-bar');
  const pct   = document.getElementById('progress-pct');
  const label = document.getElementById('processing-label');
  const sub   = document.getElementById('processing-sub');
  bar.style.strokeDasharray = RING;

  let timer = null, startedAt = 0, downloading = false;

  function set(p) {
    p = Math.max(0, Math.min(100, p));
    bar.style.strokeDashoffset = RING * (1 - p / 100);
    pct.textContent = `${Math.round(p)}%`;
    ring.setAttribute('aria-valuenow', Math.round(p));
  }
  function estimate() {
    startedAt = performance.now();
    label.textContent = copy.processing.cutting;
    sub.textContent = '';
  }

  return {
    start() {
      downloading = false;
      set(0);
      estimate();
      clearInterval(timer);
      timer = setInterval(() => {
        if (downloading) return;
        const secs = (performance.now() - startedAt) / 1000;
        set(95 * (1 - Math.exp(-secs / 1.2)));
      }, 50);
    },
    download(p) {
      downloading = p < 100;
      label.textContent = copy.processing.setup;
      sub.textContent = copy.processing.setupSub;
      set(p);
      if (!downloading) { set(0); estimate(); } // download done → cutting starts
    },
    finish() {
      clearInterval(timer);
      set(100);
    },
  };
})();

if (isNative) {
  BackgroundRemover.addListener('modelDownload', ({ percent }) => progress.download(percent));
}

export async function removeBackground(jpegDataURL) {
  const base64 = jpegDataURL.split(',')[1];
  if (!isNative) return { base64, mime: 'image/jpeg' };

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('it took too long')), BG_TIMEOUT_MS));
  const { image } = await Promise.race([
    BackgroundRemover.removeBackground({ image: base64 }),
    timeout,
  ]);
  return { base64: image, mime: 'image/png' };
}
