# Foundations (brand layer, all platforms)

Values here are platform-neutral. Exact numbers live in [`tokens.json`](tokens.json);
each platform maps them in [`platforms/`](platforms/).

---

## 1. Principles

1. **Brand screens, native system moments.** Every screen (home, camera, processing, review, detail) is drawn in the brand look. Native components appear only for system moments: confirmation dialogs, sheets, pickers, permission prompts, launch screen. Those are themed (brand colors and font), never restyled.
2. **Objects shine, interface recedes.** Cut-outs float on a calm, dotted surface; chrome is a few round controls.
3. **A little archive, lightly.** Each object keeps its name, the day it was found and its story, set openly under it. The archive feel comes from type (small-caps dates), never from boxes or heavy decoration.
4. **Personality in the details.** Heavy grid names with a white sticker stroke, round orange actions, a soft press, two small moments of delight (the reveal and the drop) and a holographic tilt.
5. **One of each role.** Two typefaces with fixed jobs (serif for display, sans for everything else), one icon set, one spacing grid, one press feedback, one style per control role.
6. **Warm and short words.** Lowercase. See [`content.md`](content.md).

---

## 2. Color roles

| Role | Value | Use |
|---|---|---|
| `bg` | `#EDECEA` | Background of every brand screen |
| `dot` | `#CCC8C2` | Progress track |
| `wash` | hue 16% → hue-2 10% | Soft hue wash behind every screen: orange light from the top, a hint of maroon at the bottom (replaced the dot texture) |
| `text` | `#111111` | Names, titles, body, icons |
| `text-secondary` | `#636363` | Count, overlines (dates), placeholders (5.1:1 on `bg`) |
| `line` | 10% black | Resting underline of an empty name field |
| `accent` | `#F5A742` | **Brand orange.** Primary buttons, toast icons, progress ring, focused underline |
| `on-accent` | `#683F00` | Text and icons on orange (4.6:1) |
| `round` | `#E2DFDB` | Secondary round buttons (Retake, Delete) |
| `sticker` | `#FFFFFF` | Outline round cut-outs and grid names |
| `sheen-*` | white / pink / blue, translucent | Holographic glint on the tilting detail cut-out |
| `scrim` | 45% black + 6px blur | Floating close button (white icon) |
| `camera` / `on-camera` | `#000` / `#FFF` | Camera screen |
| `toast` / `on-toast` | `#2B2926` / `#F4F2EF` | Snackbar (13:1) |

The native theme uses Material 3 roles derived from the same orange (see
[`platforms/android.md`](platforms/android.md#native-system-moments)).

---

## 3. Typography

Two typefaces, both OFL and bundled (work offline):

- **Bricolage Grotesque** (variable 200–800) for **character**: the home title,
  the empty-state title, object names (grid, review, detail) and the progress %.
  Quirky and bold; it's what makes collectobjects look like itself rather than
  CapWords (Nunito) or Kept (serif wordmark).
- **Instrument Sans** (variable 400–700) for **reading**: body and story text,
  buttons (600, not heavy), dates, counts, snackbars. Clean and very legible.
  Native Android dialogs use it too (`res/font/brand_font`, 400/600).

| Token | Font | Size / line | Weight | Use |
|---|---|---|---|---|
| `display` | Bricolage | 28 / 1.1, −0.5 | 700 | Home title "collection" |
| `headline` | Bricolage | 26 / 1.15, −0.3 | 700 | Empty-state title, review name input, detail name |
| `title` | Bricolage | 22 / 1.25 | 800 | Progress % |
| `name` | Bricolage | 15 / 1.2, +0.2 | 800 | Grid object name (white stroke) |
| `label` | Instrument Sans | 15 / 1.2, +0.2 | 600 | Buttons, processing label, snackbar action |
| `body` | Instrument Sans | 15 / 1.5 | 400 | Story, descriptions, snackbar |
| `caption` | Instrument Sans | 13 / 1.4 | 400 | Count, subtitles |
| `overline` | Instrument Sans | 13 / 1.3, +1.2, all small caps, tabular figures | 500 | Home date, grid date, detail date; `text-secondary` |

**Pairing:** a serif title is always followed by sans (overline, caption or body);
two serif lines never stack. The words stay lowercase in the copy; the overline
shows them as small caps.

**Grid names** carry a 4px white stroke behind the letters (`paint-order: stroke fill`),
the "sticker" feel. Serif text never does.

---

## 4. Spacing, shape, elevation

- **Spacing (4px grid):** 4 · 8 · 12 · 16 · 24 · 32 · 40 · 64. Screen side margin **16** on every screen.
- **Home header:** overline date → 4 → display title → 4 → caption count → 32 → grid.
- **Grid:** 2 columns, gutter 16, rows 32; tile = square image, 8 → name, 4 → number.
- **Review:** image (fills what's left) → 24 → name → 24 → actions.
- **Detail:** image → 24 → name → 4 → date → 16 → story → 24 → round delete. Centred, max width 340, no box.
- **Liquid Glass** (Android and iPhone): the tab bar and the round buttons (close, ⋯, retake) are see-through paper (`rgb(250 249 247 / .55)`) with a 16px blur, a bright hairline rim and the one shadow. Share on the close-up is tertiary: the icon alone (Material Symbols `ios_share`).
- **Shape:** round everything interactive: buttons and close are full circles/pills, the add tile is a rounded square like the objects; snackbar radius 20.
- **Elevation:** orange glow under orange controls; soft dark shadow under the snackbar and cut-outs. Nothing else is raised.
- **Touch targets:** ≥ 48 (close is a 40 circle in a 48 target).

---

## 5. Signature: the cut-out object

Identical everywhere (grid, empty state, review, detail):
- Object cut out with a transparent background, trimmed to its edges with a ~4% margin.
- **No outline:** just a soft shadow `0 6px 18px rgba(0,0,0,0.12)` (the white sticker outline was removed so the object itself shines).
- Floats directly on `bg` with the soft hue wash; never placed in a card or box.

**Exhibit number:** every object still gets a permanent number when saved (highest so far + 1, never reused), kept in the data for future use (e.g. sharing cards) but not shown in the UI.

---

## 6. Motion and haptics

- **Press:** everything tappable scales to 0.95 (200ms ease).
- **Screens:** overlays fade in/out (250ms). The snackbar fades and rises 8px.
- **Progress:** the orange ring fills smoothly, % in the middle.
- **The reveal** (review opens with a new cut-out): the object starts at 0.86 and flat (no outline or shadow), then over 600ms lifts to full size with a gentle overshoot while the shadow grows in. Light haptic tap as it lifts.
- **The drop** (back on the grid after saving): the new tile drops in from 24 above at 0.9, overshoots a touch and settles (500ms); the count is already updated. Success haptic as it lands.
- **Holographic tilt** (detail): the cut-out tilts with the phone, up to 12° each way, smoothed; a soft white/pink/blue glint clipped to the object's shape slides across it. On a desktop it follows the pointer. Stops when the detail closes.
- Overshoot easing is only for the reveal and the drop; everything else is calm.
- **Reduce motion:** fades only. No scaling, no overshoot, no tilt, no sheen (the reveal fades the outline in; the drop fades the tile in).
- **Arrival:** on launch the objects rise in one after another (16 up, 0.96 → 1, 600ms, 45ms apart).
- **Flight** (open a close-up): the object flies from its tile into the close-up with a soft overshoot (460ms) while the screens cross-fade and the glow blooms in behind it; closing, it flies home to its tile (380ms).
- **Poof** (delete): the object shrinks to 0.6, blurs and fades (260ms) before the close-up closes.
- **Tab bar:** shrinks to its icons when you scroll down, labels come back when you scroll up.
- **Haptics** (Android and iPhone): light on a tab, opening an object, the ⋯ menu, Share and the reveal; medium on Capture and the shutter; success on save; warning on delete.
- **Reduce motion:** arrival and drop become fades; no flight, poof, tilt or sheen.

---

## 7. Iconography

**Material Symbols Rounded**, weight 400, fill 0, inlined as an SVG sprite.
Sizes: 18 (toast, city chip), 24 (default), 32 (add tile), 40 (camera-off message). Concept map in
[`components.md`](components.md#icon-map). iOS uses SF Symbols.

---

## 8. Accessibility

- Text contrast WCAG AA (secondary text 5.1:1 on `bg`, brown on orange 4.6:1).
- Every icon-only control has an accessible label (lowercase, see [`content.md`](content.md)).
- Visible focus ring (`#683F00`) for keyboard/switch users.
- Reduce-motion respected (see Motion).
