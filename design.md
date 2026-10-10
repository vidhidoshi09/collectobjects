# Memories — Design System

**Single source of truth for the app's look, feel and words.** Every value in
`css/app.css` comes from the tokens below; nothing is hardcoded.

Three layers, like apps that feel both branded and native (e.g. Claude):

1. **Brand** (ours): colors, background texture, typeface, cut-out object style, words.
2. **Native Android**: real platform components wherever the platform offers one
   (dialogs, bottom sheets, share sheet, permission prompts, photo picker),
   themed with the brand colors via the app's Material 3 Android theme.
3. **Material 3 in-app**: everything drawn inside the app's screens (buttons, FAB,
   top app bars, text fields, progress, snackbars) follows Material 3 metrics,
   state layers and motion exactly, wearing the brand colors and font.

A fully native iOS version (Liquid Glass) is planned for v2.

---

## 1. Principles

1. **Objects shine, interface recedes.** Cut-outs float on a calm surface; chrome is quiet.
2. **Brand where it's ours, native where it's the platform's.** Never restyle a native component beyond brand colors.
3. **Material, not "Material-ish".** In-app components use Material metrics, motion and state layers as specified. No custom one-offs.
4. **One of each.** One font, one icon set, one spacing grid, one press feedback.
5. **Warm and short words.** See §9.

---

## 2. Color

**Brand palette, mapped onto Material 3 color roles** so in-app and native
components use it consistently. Values marked † were adjusted only to meet WCAG AA.

| Role | Hex | Use |
|---|---|---|
| `surface` | `#EDECEA` | App background, all screens (brand warm grey) |
| `surface-container` | `#E6E3E0` | Filled text fields, tonal buttons |
| `surface-container-high` | `#F7F6F4` | Raised areas |
| `dot` | `#CCC8C2` | Background dot texture (1px dots every 28px) |
| `on-surface` | `#111111` | Primary text, names, icons on surface |
| `on-surface-variant` | `#636363` † (was `#888`; AA on surface and surface-container) | Secondary text, dates, inactive icons |
| `outline` | `#8A8580` | Text-field underline, borders |
| `outline-variant` | `#CCC8C2` | Dividers, progress track |
| `primary-container` | `#F5A742` | **Brand orange.** FAB, hero CTA, Save button |
| `on-primary-container` | `#683F00` † (was white) | Text/icons on brand orange |
| `primary` | `#875300` | Focus rings, active text-field line, text buttons, progress indicator |
| `on-primary` | `#FFFFFF` | Content on `primary` |
| `error` | `#BA1A1A` | Destructive action labels |
| `inverse-surface` | `#2B2926` | Snackbar background |
| `inverse-on-surface` | `#F4F2EF` | Snackbar text |
| `inverse-primary` | `#FFB868` | Snackbar action |
| `scrim` | `#000000` | Behind modal content at 32% |
| `camera` | `#000000` | Camera screen |

`primary` comes from Material Color Utilities (Fidelity scheme, seed `#F5A742`),
so it is the same hue family as the brand orange.

**State layers** (Material): pressed/focus 10%, hover 8% of the content color.

**Native theme:** `android/app/src/main/res/values/styles.xml` uses a Material 3
parent theme with `colorPrimary=#875300`, `colorPrimaryContainer=#F5A742`,
`colorOnPrimaryContainer=#683F00`, `colorSurface=#EDECEA`, `colorOnSurface=#111111`,
`colorError=#BA1A1A`, so native dialogs and sheets match.

---

## 3. Typography

**Nunito Sans** (brand, variable weight, OFL), bundled in `assets/fonts/` so it
works offline. Sizes follow the Material type scale; weights stay light so the
type feels calm: **400 regular** and **600 semibold** only (600 is Nunito's visual
match for Material's "medium" labels). No 900, no outlined text.

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `headline-medium` | 28 / 36 | 600 | Screen title "Memories" |
| `headline-small` | 24 / 32 | 600 | Detail name, empty-state title |
| `title-large` | 22 / 28 | 600 | Top app bar title (review) |
| `title-medium` | 16 / 24 | 600 | Processing label |
| `title-small` | 14 / 20 | 600 | Grid item name |
| `body-large` | 16 / 24 | 400 | Text-field input, body copy |
| `body-medium` | 14 / 20 | 400 | Descriptions, story text, subtitle |
| `body-small` | 12 / 16 | 400 | Grid item date, helper text |
| `label-large` | 14 / 20 | 600 | All buttons, snackbar action |
| `label-medium` | 12 / 16 | 600 | Overline (today's date) |

Native dialogs and sheets use the platform font (Roboto), as native components should.

---

## 4. Icons

**Material Symbols Outlined**, weight 400, grade 0, optical size 24, inlined as SVG.
Fill 0 by default, Fill 1 only for a selected/active state.

| Size | Use |
|---|---|
| 24px | Default (app bars, buttons, FAB) |
| 20px | Inside buttons with a label (Material 18–20) |
| 48px | Empty-state / hero only |

Icons sit in **standard icon buttons**: 40px circle container, 48px touch target,
no background (state layer only), color `on-surface-variant`.
On the camera screen, icons are white over a `#000` 40% scrim circle for legibility.

Icon map: add `add` · back `arrow_back` · close `close` · gallery `photo_library` ·
retake `refresh` · delete `delete` · camera `photo_camera` · edit `edit`.

---

## 5. Shape, space, elevation

**Shape scale:** extra-small 4 · small 8 · medium 12 · large 16 · extra-large 28 · full (pill/circle).
- FAB: large (16). Buttons: full. Dialog: extra-large (28). Snackbar: extra-small (4).
  Filled text field: extra-small top corners only.

**Spacing (4px grid):** 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64.
- Screen side margin: 16. Grid gutter: 16. Section gap: 24–32.

**Elevation (shadows):** level 0 none · level 1 (cards/dialog lift) · level 3 (FAB).
Use Material's key + ambient shadow pairs. Cut-out objects keep their own soft drop shadow and white sticker outline (brand).

**Touch targets:** minimum 48×48.

---

## 6. Motion

Material easing and durations:

| Token | Curve | Duration | Use |
|---|---|---|---|
| `emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 400ms | Screens/overlays entering |
| `emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 200ms | Screens/overlays leaving |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | 300ms | Small changes (colors, fades) |
| `short` | `standard` | 150ms | State layers |

- Full-screen overlays enter with fade + 32px rise; leave with fade.
- Every tappable element has a **ripple** + pressed state layer. No scale-on-press.
- Respect `prefers-reduced-motion` (fades only).

---

## 7. Components

| Component | Spec |
|---|---|
| **Top app bar** (detail, review) | 64px tall, `surface` bg. Leading `arrow_back` (detail) or `close` (review/camera) icon button; title `title-large`; trailing action icon buttons (detail: `delete`). |
| **Home header** | Overline today's date (`label-medium`, `on-surface-variant`), title "Memories" (`headline-medium`), subtitle count (`body-medium`, `on-surface-variant`). 16px side margin. |
| **FAB** | 56×56, radius 16, `primary-container` bg, `add` icon in `on-primary-container`, elevation 3. Bottom-right, 16px from edges + safe area. Hidden on the empty state. |
| **Filled button** (primary action, e.g. Save) | Height 40, radius full, padding 24 (16 with icon), `primary-container` bg, `on-primary-container` text, `label-large`. |
| **Hero CTA** (empty state) | Large filled button in `primary-container`/`on-primary-container`, leading 24px icon, height 56, padding 24. |
| **Tonal button** | `surface-container` bg, `on-surface` label (Retake). |
| **Text button** | `primary` text, dialog actions. Destructive: `error` text. |
| **Filled text field** | `surface-container` bg, radius 4 4 0 0, 1px `on-surface-variant` bottom line → 2px `primary` on focus, floating label (`body-small` when floated), input `body-large`. Height 56. Multi-line for Story. |
| **Grid item** | Cut-out image (square, contain), name `title-small` `on-surface`, date `body-small` `on-surface-variant`, centered. 2 columns, gutter 16. |
| **Circular progress** (processing) | Determinate, 48px, 4px stroke, `primary` indicator, `outline-variant` track with 4px gap (Expressive), percentage `title-medium` below the label. |
| **Dialog** (delete) | **Native Android dialog** (`@capacitor/dialog` confirm), themed by the Material 3 app theme. |
| **Bottom sheet** (choices) | **Native Android bottom sheet** (`@capacitor/action-sheet`) whenever the user picks between actions. |
| **Snackbar** (errors, confirmations) | `inverse-surface` bg, `inverse-on-surface` `body-medium`, radius 4, 16px from bottom/sides, optional action in `inverse-primary`. Auto-dismiss 4s. Replaces all `alert()`s. |
| **Camera controls** | Shutter 72px white with 4px white ring offset; gallery 48px icon button (white icon, 40% black scrim) to its left; mirror spacer right. |

---

## 8. Screens

1. **Home (grid):** header, 2-column grid, FAB.
2. **Empty state:** three sample cut-outs (croissant, teapot, duck), centre raised; title, one line of body, hero CTA "Create now". FAB hidden.
3. **Camera:** full-bleed preview, `close` top-left, controls bottom.
4. **Processing:** centred circular progress + label + %.
5. **Review:** top app bar (`close`), cut-out, filled text field "Name", actions: tonal "Retake" + filled "Save".
6. **Detail:** top app bar (`arrow_back`, `delete`), cut-out, editable name (`headline-small`, tap to edit), date, filled multi-line text field "Story".

---

## 9. UX copy

**Voice:** warm, calm, brief. Sentence case. Talk to "you". No jargon, no blame, no emoji, no exclamation marks.

| Where | Copy |
|---|---|
| Home subtitle | "1 memory" / "{n} memories" |
| Empty title | "Keep the little things" |
| Empty body | "Snap an object that matters to you. We'll cut it out and keep it in your collection." |
| Empty CTA | "Create now" |
| Camera blocked | "Camera is off. Turn it on in Settings, or choose a photo instead." |
| Processing | "Cutting it out…" |
| First-time model download | "Getting ready…" + "One-time setup" |
| Review field label | "Name" (placeholder "Name it…") |
| Review actions | "Retake" · "Save" |
| Default name | "Untitled memory" |
| Story field label | "Story" (placeholder "Add the story behind it…") |
| Delete dialog | Title "Delete this memory?" · body "This can't be undone." · actions "Cancel" / "Delete" |
| Snackbar: deleted | "Memory deleted" |
| Snackbar: cut-out failed | "Couldn't cut this one out, so we kept the full photo." |
| Snackbar: save failed | "Couldn't save. Please try again." |
| Snackbar: photo unreadable | "That photo couldn't be opened. Try another one." |
| Snackbar: load failed | "Couldn't load your memories. Please restart the app." |

---

## 10. Accessibility

- Text contrast WCAG AA (guaranteed by the color roles above).
- Touch targets ≥ 48px; every icon button has an `aria-label`.
- Visible focus (2px `primary` outline, 2px offset) for keyboard users.
- `prefers-reduced-motion` respected.
