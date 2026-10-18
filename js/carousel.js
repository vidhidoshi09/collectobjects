import { reducedMotion } from './motion.js';

/* ════════════════════════════════════════════════
   CAROUSEL — the close-up swipes through the whole collection
   Slides sit side by side, the open one in the middle; its neighbours peek
   in smaller and softer. The row follows the finger, then settles on the
   nearest object (or the next one after a quick flick). Arrow keys work too.
   `onChange(index)` runs whenever a different object settles in the middle.
════════════════════════════════════════════════ */
const STEP      = 0.78;  // distance between slides, as a share of a slide's width (neighbours peek)
const SIDE      = 0.72;  // a neighbour's size
const FADE      = 0.45;  // how much a neighbour fades
const FLICK     = 0.35;  // px per ms: a flick this fast moves one object, however short
const THRESHOLD = 0.22;  // or a drag of this share of the step
const SETTLE_MS = 380;

export function createCarousel(root, track, { onChange }) {
  let slides = [], index = 0, drag = 0, width = 0;

  const step = () => width * STEP;

  function layout(animate) {
    track.classList.toggle('is-settling', animate && !reducedMotion());
    slides.forEach((el, i) => {
      const d = i - index + drag / step();     // distance from the middle, in slides
      const far = Math.min(Math.abs(d), 1);
      el.style.transform = `translateX(${d * step()}px) scale(${1 - (1 - SIDE) * far})`;
      el.style.opacity = Math.abs(d) > 2.2 ? 0 : 1 - FADE * far;
      el.style.visibility = Math.abs(d) > 2.5 ? 'hidden' : '';
      el.classList.toggle('is-active', i === index && !drag);
      el.setAttribute('aria-hidden', String(i !== index));
    });
  }

  function go(next, { animate = true } = {}) {
    next = Math.max(0, Math.min(slides.length - 1, next));
    const changed = next !== index;
    index = next; drag = 0;
    layout(animate);
    if (changed) onChange(index);
  }

  // Dragging: horizontal moves take over; vertical ones are left alone
  let start = null;
  root.addEventListener('pointerdown', e => {
    if (slides.length < 2 || e.target.closest('input, button')) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now(), dragging: false };
  });
  root.addEventListener('pointermove', e => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { start = null; return; }
      start.dragging = true;
      root.setPointerCapture(e.pointerId);
    }
    // resists at the ends
    const atEnd = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
    drag = atEnd ? dx / 3 : dx;
    layout(false);
  });
  const end = e => {
    if (!start) return;
    const { dragging, t } = start;
    start = null;
    if (!dragging) return;
    const dx = drag, v = dx / (performance.now() - t);
    const by = Math.abs(v) > FLICK || Math.abs(dx) > step() * THRESHOLD ? -Math.sign(dx) : 0;
    go(index + by);
    if (e.pointerId != null && root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  // arrow keys, while the close-up is open and no field is being typed in
  document.addEventListener('keydown', e => {
    if (!root.offsetParent || e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });
  addEventListener('resize', () => { if (slides.length) { width = slides[0].offsetWidth; layout(false); } });

  return {
    // Fills the track (`html` per slide) and puts slide `at` in the middle, without animating
    set(htmls, at) {
      track.innerHTML = htmls.map(h => `<div class="slide">${h}</div>`).join('');
      slides = [...track.children];
      width = slides[0]?.offsetWidth || 0;
      index = at; drag = 0;
      layout(false);
    },
    measure() { width = slides[0]?.offsetWidth || 0; layout(false); },
    active: () => slides[index],
    get index() { return index; },
    settleMs: SETTLE_MS,
  };
}
