import { Matter, App, isNative } from './platform.js';
import { onMotion } from './sensors.js';
import { thud, rumble, tapLight } from './haptics.js';
import { reducedMotion } from './motion.js';
import { copy } from './copy.js';

/* ════════════════════════════════════════════════
   SHAKE TO TUMBLE — shake hard on the home screen and the collection lets go
   Every object falls into a heap at the bottom with real physics (Matter.js),
   shaped like its own cut-out. Drag, toss and stack them; tilting the phone
   rolls them around. "Tidy up" flies them back into the grid.
   Haptics are worked out from each cut-out, since we can't know the objects:
   fuller objects land heavier, thin or spiky ones feel sharp and clicky,
   round chunky ones soft and dull (js/haptics.js → Core Haptics on iPhone).
════════════════════════════════════════════════ */
const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Vector, Vertices } = Matter;

const SHAKE_MS2   = 22;   // m/s² without gravity, about 2.2 g: a hard shake, not a walk
const SHAKE_PEAKS = 3;    // this many peaks…
const SHAKE_WITHIN = 800; // …within this many ms
const MAX_OBJECTS = 40;   // the newest ones tumble; a bigger pile gets slow
const THUD_GAP_MS = 45;   // at most one landing tap this often; the strongest in the gap wins
const WALL = 400;         // invisible wall thickness
// The film feel: slow motion, soft gravity, bouncy and floaty, never quite still
const TIME_SCALE  = 0.6;    // the world runs at 60% speed
const GRAVITY     = 0.0009;
const BODY = { restitution: 0.55, friction: 0.12, frictionStatic: 0.2, frictionAir: 0.028 };
const SWAY        = 0.28;   // the pile drifts gently left and right…
const SWAY_PERIOD = 4200;   // …over this many ms
const HOP_EVERY   = [900, 2200]; // now and then one object does a soft hop (ms, min–max)
const BLUR_SPEED  = 9;      // px per step at which motion blur peaks (1.6px)

let scene = null; // { engine, layer, items, frame, stopTilt, mouse }

/* ── How an object feels, from its cut-out ─────────────────────────── */
const SAMPLE = 48;
function feelOf(img) {
  const fallback = { hull: null, sharpness: 0.5, weight: 0.6 };
  try {
    const c = document.createElement('canvas');
    c.width = c.height = SAMPLE;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return fallback;
    const s = Math.min(SAMPLE / w, SAMPLE / h); // contained, like the tile
    const dw = w * s, dh = h * s, dx = (SAMPLE - dw) / 2, dy = (SAMPLE - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);
    const pts = [];
    let minX = SAMPLE, minY = SAMPLE, maxX = 0, maxY = 0;
    for (let y = 0; y < SAMPLE; y++) {
      for (let x = 0; x < SAMPLE; x++) {
        if (data[(y * SAMPLE + x) * 4 + 3] > 40) {
          pts.push({ x: (x + 0.5) / SAMPLE, y: (y + 0.5) / SAMPLE });
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
    }
    if (pts.length < 12) return fallback;
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const fill = pts.length / (bw * bh);            // 1 = a solid block, low = thin or spiky
    const aspect = Math.max(bw, bh) / Math.min(bw, bh);
    const share = pts.length / (SAMPLE * SAMPLE);   // how much of the tile it fills
    return {
      hull: convexHull(pts),
      sharpness: clamp(0.2 + (1 - fill) * 0.7 + (aspect - 1) * 0.12, 0.15, 0.95),
      weight: clamp(0.3 + share * 1.4, 0.3, 1),
    };
  } catch {
    return fallback; // a photo the canvas can't read
  }
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Andrew's monotone chain
function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// the home-indicator area at the bottom (env() can't be read from JS directly)
function safeBottom() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden';
  document.body.append(probe);
  const v = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return v;
}

/* ── Landing taps ──────────────────────────────────────────────────── */
let pending = null, timer = 0;
function landing(intensity, sharpness) {
  if (!pending || intensity > pending.intensity) pending = { intensity, sharpness };
  if (timer) return;
  timer = setTimeout(() => {
    timer = 0;
    if (pending) thud(pending.intensity, pending.sharpness);
    pending = null;
  }, THUD_GAP_MS);
}

/* ── The pile ──────────────────────────────────────────────────────── */
async function tumble() {
  if (scene || reducedMotion()) return;
  const tiles = [...document.querySelectorAll('#grid .card img')].slice(0, MAX_OBJECTS);
  if (!tiles.length) return;
  await Promise.all(tiles.map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); }));
  rumble();

  const W = innerWidth, H = innerHeight;
  const floor = H - safeBottom() - 8;
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: GRAVITY } });
  engine.timing.timeScale = TIME_SCALE;
  Composite.add(engine.world, [
    Bodies.rectangle(W / 2, floor + WALL / 2, W * 3, WALL, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(-WALL / 2, H / 2 - H, WALL, H * 4, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(W + WALL / 2, H / 2 - H, WALL, H * 4, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(W / 2, -H * 2 - WALL / 2, W * 3, WALL, { isStatic: true, label: 'wall' }), // a high ceiling: tosses come back
  ]);

  const layer = document.createElement('div');
  layer.id = 'tumble';
  layer.innerHTML = `<button class="tumble__tidy glass" type="button">${copy.tumble.tidy}</button>`;
  document.body.append(layer);
  document.body.classList.add('is-tumbling');

  const items = tiles.map((tile, i) => {
    const r = tile.getBoundingClientRect();
    const size = r.width;
    const feel = feelOf(tile);
    // tiles scrolled out of view drop in from above
    const visible = r.bottom > 0 && r.top < H;
    const cx = visible ? r.left + size / 2 : size / 2 + Math.random() * (W - size);
    const cy = visible ? r.top + size / 2 : -size * (1 + (i % 6));
    const verts = feel.hull?.length >= 3 ? feel.hull.map(p => ({ x: (p.x - 0.5) * size, y: (p.y - 0.5) * size })) : null;
    const centre = verts ? Vertices.centre(verts) : { x: 0, y: 0 };
    const opts = { ...BODY, density: 0.0012 * feel.weight };
    const body = verts
      ? Bodies.fromVertices(cx + centre.x, cy + centre.y, [verts], opts)
      : Bodies.rectangle(cx, cy, size * 0.8, size * 0.8, opts);
    body.plugin.feel = feel;
    // let go: a little kick and spin
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
    Composite.add(engine.world, body);

    const el = tile.cloneNode();
    el.removeAttribute('loading');
    el.className = `${tile.className} tumble__obj`;
    el.style.width = el.style.height = `${size}px`;
    layer.append(el);
    return { body, el, tile, size, offset: { x: -centre.x, y: -centre.y } };
  });

  // drag and toss
  const mouse = Mouse.create(layer);
  const grab = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1 } });
  Composite.add(engine.world, grab);
  Events.on(grab, 'startdrag', () => tapLight());

  // landings: harder hits, heavier objects → stronger taps; the object's shape sets the texture
  Events.on(engine, 'collisionStart', e => {
    for (const { bodyA, bodyB } of e.pairs) {
      const speed = Vector.magnitude(Vector.sub(bodyA.velocity, bodyB.velocity));
      const impact = clamp((speed - 1) / 9, 0, 1);
      if (impact < 0.06) continue;
      const a = bodyA.plugin.feel, b = bodyB.plugin.feel;
      const weight = Math.max(a?.weight ?? 0, b?.weight ?? 0) || 0.5;
      const sharpness = ((a?.sharpness ?? 0.45) + (b?.sharpness ?? 0.45)) / 2;
      landing(clamp(0.15 + impact * 0.85 * (0.6 + weight * 0.4), 0.1, 1), sharpness);
    }
  });

  // tilting the phone rolls them around
  const stopTilt = onMotion(({ gamma }) => {
    tiltX = gamma == null ? 0 : clamp(Math.sin((gamma * Math.PI) / 180) * 1.2, -1, 1);
  });
  let tiltX = 0;

  // now and then, one object (not the one in your hand) does a soft little hop
  let hopAt = performance.now() + 1800;
  const hop = now => {
    if (now < hopAt) return;
    hopAt = now + HOP_EVERY[0] + Math.random() * (HOP_EVERY[1] - HOP_EVERY[0]);
    const free = items.filter(it => it.body !== grab.body && it.body.speed < 0.6);
    const it = free[Math.floor(Math.random() * free.length)];
    if (!it) return;
    Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 4, y: -(5 + Math.random() * 3.5) });
    Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.12);
  };

  let last = performance.now();
  const step = now => {
    engine.gravity.x = tiltX + SWAY * Math.sin((now / SWAY_PERIOD) * Math.PI * 2); // the slow sway
    hop(now);
    Engine.update(engine, Math.min(now - last, 33));
    last = now;
    for (const it of items) {
      const { position: p, angle, speed } = it.body;
      const o = Vector.rotate(it.offset, angle); // the image's centre, from the body's centre of mass
      it.el.style.transform = `translate(${p.x + o.x - it.size / 2}px, ${p.y + o.y - it.size / 2}px) rotate(${angle}rad)`;
      // a touch of motion blur while it moves fast, like film
      const blur = Math.round(Math.min(speed / BLUR_SPEED, 1) * 16) / 10;
      if (blur !== it.blur) { it.blur = blur; it.el.style.filter = blur ? `var(--sticker-filter) blur(${blur}px)` : ''; }
    }
    scene.frame = requestAnimationFrame(step);
  };
  scene = { engine, layer, items, stopTilt, mouse, frame: requestAnimationFrame(step) };
  layer.querySelector('.tumble__tidy').addEventListener('click', tidy);
}

// Everything flies back to its tile
async function tidy() {
  if (!scene) return;
  const { engine, layer, items, stopTilt, frame } = scene;
  cancelAnimationFrame(frame);
  stopTilt();
  tapLight();
  layer.querySelector('.tumble__tidy').remove();
  await Promise.all(items.map((it, i) => {
    const r = it.tile.getBoundingClientRect();
    return it.el.animate(
      [{ transform: it.el.style.transform }, { transform: `translate(${r.left}px, ${r.top}px) rotate(0rad)` }],
      { duration: 520, delay: i * 18, easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)', fill: 'forwards' },
    ).finished.catch(() => {});
  }));
  Engine.clear(engine);
  layer.remove();
  document.body.classList.remove('is-tumbling');
  scene = null;
}

/* ── Shake detection: home screen only ─────────────────────────────── */
export function initTumble() {
  let peaks = [];
  const onHome = () => !document.querySelector('.overlay.active') && !scene;
  const listen = () => onMotion(({ ax, ay, az }) => {
    if (ax == null || !onHome()) return;
    if (Math.hypot(ax, ay, az) < SHAKE_MS2) return;
    const now = performance.now();
    peaks = peaks.filter(t => now - t < SHAKE_WITHIN);
    if (!peaks.length || now - peaks.at(-1) > 90) peaks.push(now); // one peak per jolt
    if (peaks.length >= SHAKE_PEAKS) { peaks = []; tumble(); }
  });
  let stop = listen();
  // no sensors while the app is in the background
  if (isNative) {
    App.addListener('pause', () => { stop(); stop = () => {}; });
    App.addListener('resume', () => { stop(); stop = listen(); });
  }
  // the browser preview has no shake: dispatch this event to try it
  addEventListener('collectobjects:shake', tumble);
  // the hardware back button tidies up first
  return { isTumbling: () => Boolean(scene), tidy };
}
