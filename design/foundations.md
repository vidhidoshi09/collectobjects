# Foundations (brand layer, all platforms)

Values here are platform-neutral. Exact numbers live in [`tokens.json`](tokens.json);
each platform maps them in [`platforms/`](platforms/).

---

## 1. Principles

1. **Brand screens, native system moments.** Every screen (home, camera, processing, review, detail) is drawn in the brand look. Native components appear only for system moments: confirmation dialogs, sheets, pickers, permission prompts, launch screen. Those are themed (brand colors and font), never restyled.
2. **Objects shine, interface recedes.** Cut-outs float on a calm, dotted surface; chrome is a few round controls.
3. **A little archive.** Every object has a permanent exhibit number and a placard with its story, like a label on a gallery wall. The archive feel comes from type and labels (serif titles, small-caps overlines, the placard), never from heavy decoration.
4. **Personality in the details.** Heavy grid names with a white sticker stroke, round orange actions, a soft press, two small moments of delight (the reveal and the drop) and a holographic tilt.
5. **One of each role.** Two typefaces with fixed jobs (serif for display, sans for everything else), one icon set, one spacing grid, one press feedback, one style per control role.
6. **Warm and short words.** Lowercase. See [`content.md`](content.md).

---

## 2. Color roles

| Role | Value | Use |
|---|---|---|
| `bg` | `#EDECEA` | Background of every brand screen |
| `dot` | `#CCC8C2` | Dot texture (1px every 28px), progress track |
| `text` | `#111111` | Names, titles, body, icons |
| `text-secondary` | `#636363` | Count, overlines (date, no.), placeholders (5.1:1 on `bg`, 5.6:1 on `placard`) |
| `line` | 10% black | Resting underline of an empty name field, placard rule |
| `accent` | `#F5A742` | **Brand orange.** FAB, primary buttons, progress ring, focused underline |
| `on-accent` | `#683F00` | Text and icons on orange (4.6:1) |
| `round` | `#E2DFDB` | Secondary round buttons (Retake, Delete) |
| `sticker` | `#FFFFFF` | Outline round cut-outs and grid names |
| `placard` | `#F8F7F5` | The placard on the detail screen (a lighter warm white than `bg`) |
| `sheen-*` | white / pink / blue, translucent | Holographic glint on the tilting detail cut-out |
| `scrim` | 45% black + 6px blur | Floating close button (white icon) |
| `camera` / `on-camera` | `#000` / `#FFF` | Camera screen |
| `toast` / `on-toast` | `#2B2926` / `#F4F2EF` | Snackbar (13:1) |

The native theme uses Material 3 roles derived from the same orange (see
[`platforms/android.md`](platforms/android.md#native-system-moments)).

---

## 3. Typography

One typeface: **Bricolage Grotesque** (variable weight 200–800, OFL), bundled so it
works offline. Quirky, bold and current: it's what makes collectobjects look like
itself rather than like CapWords (Nunito) or Kept (serif wordmark). Weights: **400**
body, **700** display roles, **800** grid names, buttons and the progress %. Native
Android dialogs use the same family through the theme (`res/font/brand_font`, 400/600).

| Token | Font | Size / line | Weight | Use |
|---|---|---|---|---|
| `display` | Bricolage | 40 / 1.05, −0.5 | 700 | Home title "collection" |
| `headline` | Bricolage | 30 / 1.1, −0.3 | 700 | Empty-state title, review name input, placard name |
| `title` | Bricolage | 22 / 1.25 | 800 | Progress % |
| `label` | Bricolage | 15 / 1.2, +0.2 | 800 | Grid name, buttons, processing label |
| `body` | Bricolage | 14 / 1.5 | 400 | Story, descriptions, snackbar |
| `caption` | Bricolage | 13 / 1.4 | 400 | Count, subtitles |
| `overline` | Bricolage | 14 / 1.3, +1.2, all small caps, tabular figures | 400 | Home date, "no. 007" in the grid, placard meta line; `text-secondary` |

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
- **Detail:** image → 24 → **placard** → 24 → round delete. Placard: padding 16 top, 24 sides and bottom; name → 4 → meta → 16 → hairline → 12 → story. Max width 340, left-aligned.
- **Shape:** round everything interactive: buttons, FAB and close are full circles/pills; snackbar radius 20. The placard is the one squared shape (radius 4), like a printed label.
- **Elevation:** orange glow under orange controls; soft dark shadow under the snackbar and cut-outs; a barely-there shadow under the placard. Nothing else is raised.
- **Touch targets:** ≥ 48 (close is a 40 circle in a 48 target).

---

## 5. Signature: the cut-out object

Identical everywhere (grid, empty state, review, detail):
- Object cut out with a transparent background, trimmed to its edges with a ~4% margin.
- **White sticker outline** (~2px) + soft shadow `0 6px 18px rgba(0,0,0,0.12)`.
- Floats directly on `bg` with the dot texture; never placed in a card or box (the placard sits *below* it, never behind it).

**Exhibit number:** every object gets a permanent number when it's saved
(highest so far + 1), shown as "no. 007". Numbers are never reused or changed:
deleting leaves a gap, and objects from earlier versions are numbered once, oldest first.

---

## 6. Motion and haptics

- **Press:** everything tappable scales to 0.95 (200ms ease).
- **Screens:** overlays fade in/out (250ms). The snackbar fades and rises 8px.
- **Progress:** the orange ring fills smoothly, % in the middle.
- **The reveal** (review opens with a new cut-out): the object starts at 0.86 and flat (no outline or shadow), then over 600ms lifts to full size with a gentle overshoot while the white outline and shadow grow in. Light haptic tap as it lifts.
- **The drop** (back on the grid after saving): the new tile drops in from 24 above at 0.9, overshoots a touch and settles (500ms); the count is already updated. Success haptic as it lands.
- **Holographic tilt** (detail): the cut-out tilts with the phone, up to 12° each way, smoothed; a soft white/pink/blue glint clipped to the object's shape slides across it. On a desktop it follows the pointer. Stops when the detail closes.
- Overshoot easing is only for the reveal and the drop; everything else is calm.
- **Reduce motion:** fades only. No scaling, no overshoot, no tilt, no sheen (the reveal fades the outline in; the drop fades the tile in).
- **Haptics:** only these two moments (light impact on reveal, success on save). Never on plain taps.

---

## 7. Iconography

**Material Symbols Rounded**, weight 400, fill 0, inlined as an SVG sprite.
Sizes: 24 (default), 32 (FAB), 40 (camera-off message). Concept map in
[`components.md`](components.md#icon-map). iOS uses SF Symbols.

---

## 8. Accessibility

- Text contrast WCAG AA (secondary text 5.1:1 on `bg` and 5.6:1 on `placard`, brown on orange 4.6:1).
- Every icon-only control has an accessible label (lowercase, see [`content.md`](content.md)).
- Visible focus ring (`#683F00`) for keyboard/switch users.
- Reduce-motion respected (see Motion).
