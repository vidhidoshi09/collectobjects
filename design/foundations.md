# Foundations (brand layer, all platforms)

Values here are platform-neutral. Exact numbers live in [`tokens.json`](tokens.json);
each platform maps them in [`platforms/`](platforms/).

---

## 1. Principles

1. **Brand screens, native system moments.** Every screen (home, camera, processing, review, detail) is drawn in the brand look. Native components appear only for system moments: confirmation dialogs, sheets, pickers, permission prompts, launch screen. Those are themed (brand colors and font), never restyled.
2. **Objects shine, interface recedes.** Cut-outs float on a calm, dotted surface; chrome is a few round controls.
3. **Personality in the details.** Heavy names with a white sticker stroke, round orange actions, a soft press.
4. **One of each.** One font, one icon set, one spacing grid, one press feedback, one style per control role.
5. **Warm and short words.** See [`content.md`](content.md).

---

## 2. Color roles

| Role | Value | Use |
|---|---|---|
| `bg` | `#EDECEA` | Background of every brand screen |
| `dot` | `#CCC8C2` | Dot texture (1px every 28px), progress track |
| `text` | `#111111` | Names, titles, body, icons |
| `text-secondary` | `#636363` | Dates, subtitles, placeholders (5.1:1 on `bg`; was `#888`/`#bbb`) |
| `line` | 10% black | Resting underline of an empty name field |
| `accent` | `#F5A742` | **Brand orange.** FAB, primary buttons, progress ring, focused underline |
| `on-accent` | `#683F00` | Text and icons on orange (4.6:1; was white, 2.0:1) |
| `round` | `#E2DFDB` | Secondary round buttons (Retake, Delete) |
| `sticker` | `#FFFFFF` | Outline round cut-outs and names |
| `scrim` | 45% black + 6px blur | Floating close button (white icon) |
| `camera` / `on-camera` | `#000` / `#FFF` | Camera screen |
| `toast` / `on-toast` | `#2B2926` / `#F4F2EF` | Snackbar (13:1) |

The native theme uses Material 3 roles derived from the same orange (see
[`platforms/android.md`](platforms/android.md#native-system-moments)).

---

## 3. Typography

**Nunito Sans** (OFL), bundled (works offline). Brand screens use **400 regular**
and **900 heavy** only. Native dialogs use the theme's 400/600.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 28 / 1.15, −0.5 | 400 | Home title "Memories" |
| `headline` | 28 / 1.15, −0.5 | 900 | Object name on review (input) and detail |
| `title` | 22 / 1.25 | 900 | Empty-state title, progress % |
| `label` | 15 / 1.2, +0.2 | 900 | Grid name, buttons, processing label |
| `body` | 14 / 1.5 | 400 | Story, descriptions, snackbar |
| `caption` | 13 / 1.4 | 400 | Dates (grid and detail), subtitles |

**Object names** (grid, review, detail) always carry a 4px white stroke behind the
letters (`paint-order: stroke fill`), the "sticker" feel. Placeholders don't.

---

## 4. Spacing, shape, elevation

- **Spacing (4px grid):** 4 · 8 · 12 · 16 · 24 · 32 · 40 · 64. Screen side margin **16** on every screen.
- **Rhythm on single-object screens (review, detail):** image → 24 → name → 4 → date → 24 → story/actions → 24 → delete.
- **Grid:** 2 columns, gutter 16, rows 32; tile = square image, 8 → name, 4 → date.
- **Shape:** round everything: buttons, FAB and close are full circles/pills; snackbar radius 20.
- **Elevation:** orange glow under orange controls; soft dark shadow under the snackbar and cut-outs. Nothing else is raised.
- **Touch targets:** ≥ 48 (close is a 40 circle in a 48 target).

---

## 5. Signature: the cut-out object

Identical everywhere (grid, empty state, review, detail):
- Object cut out with a transparent background, trimmed to its edges with a ~4% margin.
- **White sticker outline** (~2px) + soft shadow `0 6px 18px rgba(0,0,0,0.12)`.
- Floats directly on `bg` with the dot texture; never placed in a card or box.

---

## 6. Motion

- **Press:** everything tappable scales to 0.95 (200ms ease).
- **Screens:** overlays fade in/out (250ms). The snackbar fades and rises 8px.
- **Progress:** the orange ring fills smoothly, % in the middle.
- No bouncy or decorative motion. Reduce motion → fades only, no scaling.

---

## 7. Iconography

**Material Symbols Rounded**, weight 400, fill 0, inlined as an SVG sprite.
Sizes: 24 (default), 32 (FAB), 40 (camera-off message). Concept map in
[`components.md`](components.md#icon-map). iOS uses SF Symbols.

---

## 8. Accessibility

- Text contrast WCAG AA (secondary text 5.1:1, brown on orange 4.6:1).
- Every icon-only control has an accessible label.
- Visible focus ring (`#683F00`) for keyboard/switch users.
- Reduce-motion respected.
