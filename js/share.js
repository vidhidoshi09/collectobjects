import { Filesystem, Directory, Share, isNative } from './platform.js';
import { photoSrc } from './storage.js';
import { copy, BRAND, TAGLINE } from './copy.js';
import { showSnackbar } from './snackbar.js';

/* ════════════════════════════════════════════════
   SHARE CARDS — story-sized images (1080×1920) drawn on a canvas
   · one object: the cut-out on the hue glow with sparkles, its name, date
     and city
   · the collection: a "starter pack" of up to 9 objects, numbered 01., 02. …
   Both carry the wordmark. Native: written to the cache and handed to the
   Android share sheet. Browser: Web Share with files, else a download.
════════════════════════════════════════════════ */
const W = 1080, H = 1920;

// the app's tokens, read from CSS so the card always matches the theme
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

async function fontsReady() {
  await Promise.all([
    document.fonts.load('800 80px "Bricolage Grotesque"'),
    document.fonts.load('700 80px "Bricolage Grotesque"'),
    document.fonts.load('400 40px "Instrument Sans"'),
    document.fonts.load('500 40px "Instrument Sans"'),
  ]).catch(() => {});
}

function canvas() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  return [c, c.getContext('2d')];
}

// page colour + the soft hue wash, like the app: orange light from the top, a hint of maroon at the bottom
function paper(ctx) {
  ctx.fillStyle = token('--color-bg');
  ctx.fillRect(0, 0, W, H);
  const wash = (cx, cy, rx, ry, color, alpha) => {
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(rx / ry, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    g.addColorStop(0, mix(color, token('--color-bg'), alpha));
    g.addColorStop(1, clear(token('--color-bg')));
    ctx.fillStyle = g;
    ctx.fillRect(-ry, -ry, ry * 2, ry * 2);
    ctx.restore();
  };
  wash(W / 2, 0, W * 1.2, H * 0.6, token('--hue'), 0.16);
  wash(W / 2, H, W, H * 0.5, token('--hue-2'), 0.1);
}

// the same colour at zero alpha ("rgb(r g b / a)" or "#rrggbb")
function clear(color) {
  const n = color.startsWith('#') ? [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)) : color.match(/[\d.]+/g).slice(0, 3);
  return `rgb(${n.join(' ')} / 0)`;
}

// a: weight of the first colour (both #rrggbb)
function mix(c1, c2, a) {
  const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(c1), p(c2)];
  return `rgb(${x.map((v, i) => Math.round(v * a + y[i] * (1 - a))).join(' ')})`;
}

function glow(ctx, cx, cy, r) {
  ctx.save();
  ctx.filter = 'blur(60px)';
  for (const [dx, dy, color] of [[-0.25, 0.05, token('--hue-glow-1')], [0.25, -0.05, token('--hue-glow-2')]]) {
    const g = ctx.createRadialGradient(cx + dx * r, cy + dy * r, 0, cx + dx * r, cy + dy * r, r);
    g.addColorStop(0, color); g.addColorStop(1, clear(color)); // fade the colour itself, not through black
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function sparkle(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x - s / 2, y - s / 2); ctx.scale(s / 24, s / 24);
  ctx.fillStyle = token('--color-sparkle') || '#faf9f7';
  ctx.fill(new Path2D('M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z'));
  ctx.restore();
}

// the cut-out, fitted into a box, on a soft shadow (no outline, like the app); `depth` sizes the shadow
function sticker(ctx, img, x, y, w, h, depth = 6) {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s, dh = img.height * s;
  const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
  ctx.save();
  ctx.filter = `drop-shadow(0 ${depth * 2}px ${depth * 5}px rgb(0 0 0 / 0.14))`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function text(ctx, str, x, y, { font, color, align = 'center', spacing = 0 }) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(str, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

function wordmark(ctx) {
  text(ctx, BRAND, W / 2, H - 150, { font: '800 52px "Bricolage Grotesque"', color: token('--color-text') });
  text(ctx, TAGLINE, W / 2, H - 98, { font: '400 32px "Instrument Sans"', color: token('--color-text-secondary') });
}

export async function objectCard(m) {
  await fontsReady();
  const img = await loadImage(await photoSrc(m));
  const [c, ctx] = canvas();
  paper(ctx);
  const box = { x: 160, y: 300, w: 760, h: 760 };
  glow(ctx, W / 2, box.y + box.h / 2, 460);
  sticker(ctx, img, box.x, box.y, box.w, box.h, 8);
  for (const [x, y, s] of [[170, 330, 46], [890, 280, 32], [960, 760, 52], [110, 860, 30], [640, 230, 26], [330, 1090, 36], [820, 1060, 28]]) sparkle(ctx, x, y, s);

  let y = 1250;
  if (m.name) { // naming is optional: without one, the date line moves up
    text(ctx, m.name, W / 2, y, { font: '700 80px "Bricolage Grotesque"', color: token('--color-text') });
    y += 76;
  }
  text(ctx, copy.item.dateLine(m.date, m.city).toUpperCase(), W / 2, y, { font: '500 32px "Instrument Sans"', color: token('--color-text-secondary'), spacing: 6 });
  wordmark(ctx);
  return c;
}

// newest first, up to 9, numbered like a starter pack
export async function collectionCard(objects) {
  await fontsReady();
  const picks = objects.slice(-9).reverse();
  const imgs = await Promise.all(picks.map(async m => loadImage(await photoSrc(m)).catch(() => null)));
  const [c, ctx] = canvas();
  paper(ctx);
  glow(ctx, W / 2, 900, 620);

  text(ctx, copy.share.collectionTitle, W / 2, 250, { font: '800 96px "Bricolage Grotesque"', color: token('--color-text') });
  text(ctx, copy.home.count(objects.length).toUpperCase(), W / 2, 320, { font: '500 32px "Instrument Sans"', color: token('--color-text-secondary'), spacing: 6 });

  // 2 columns for a few objects, 3 for more; rows centred between title and
  // legend, with a little jitter so it feels laid out by hand
  const cols = picks.length <= 4 ? 2 : 3, cell = cols === 2 ? 420 : 320;
  const rows = Math.ceil(picks.length / cols);
  const areaTop = 380, areaBottom = 1440;
  const top = areaTop + (areaBottom - areaTop - rows * cell) / 2;
  picks.forEach((m, i) => {
    const r = Math.floor(i / cols), inRow = Math.min(cols, picks.length - r * cols);
    const col = i % cols;
    const x0 = (W - inRow * cell) / 2 + col * cell;
    const y0 = top + r * cell;
    const jx = ((i * 37) % 30) - 15, jy = ((i * 53) % 30) - 15;
    if (imgs[i]) sticker(ctx, imgs[i], x0 + 30 + jx, y0 + 20 + jy, cell - 60, cell - 60, 5);
    text(ctx, `${String(i + 1).padStart(2, '0')}.`, x0 + cell - 40 + jx, y0 + cell - 20 + jy, { font: '500 30px "Instrument Sans"', color: token('--color-text-secondary'), align: 'right' });
  });

  // the legend: "01 grandma's teapot / 02 bath duck / …", never splitting an entry
  ctx.font = '400 30px "Instrument Sans"';
  const entries = picks.map((m, i) => `${String(i + 1).padStart(2, '0')}\u00a0${(m.name || copy.item.untitled).replace(/ /g, '\u00a0')}`);
  const lines = [];
  for (const e of entries) {
    const next = lines.length ? `${lines[lines.length - 1]} / ${e}` : e;
    if (lines.length && ctx.measureText(next).width <= 900) lines[lines.length - 1] = next;
    else lines.push(e);
  }
  let y = 1530;
  for (const line of lines.slice(0, 4)) {
    text(ctx, line, W / 2, y, { font: '400 30px "Instrument Sans"', color: token('--color-text') });
    y += 46;
  }
  wordmark(ctx);
  return c;
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'object';

// Hands a card to the share sheet (or downloads it in a browser without Web Share)
export async function shareCard(cardPromise, name) {
  try {
    const card = await cardPromise;
    const fileName = `${BRAND}-${slug(name)}.png`;
    if (isNative) {
      const data = card.toDataURL('image/png').split(',')[1];
      const { uri } = await Filesystem.writeFile({ path: fileName, data, directory: Directory.Cache });
      await Share.share({ files: [uri], dialogTitle: copy.share.dialogTitle });
      return;
    }
    const blob = await new Promise(r => card.toBlob(r, 'image/png'));
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: fileName });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  } catch (err) {
    if (err?.name === 'AbortError' || /cancel/i.test(err?.message || '')) return; // closed the sheet
    console.error('[share]', err);
    showSnackbar(copy.toast.shareFailed);
  }
}
