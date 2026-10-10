# Foundations (brand layer, all platforms)

Values here are platform-neutral. Exact numbers live in [`tokens.json`](tokens.json);
each platform maps them in [`platforms/`](platforms/).

---

## 1. Principles

1. **Objects shine, interface recedes.** Cut-outs float on a calm surface; chrome is quiet.
2. **Brand where it's ours, native where it's the platform's.** Never restyle a native component beyond its theme (brand colors and font).
3. **Platform-correct, not "platform-ish".** On each platform, in-app components follow that platform's metrics, motion and feedback exactly.
4. **One of each.** One font, one icon set per platform, one spacing grid, one press feedback per platform.
5. **Warm and short words.** See [`content.md`](content.md).

---

## 2. Color roles

Semantic roles (named after Material 3 roles, the most complete public vocabulary).
Values marked † were adjusted only to meet WCAG AA.

| Role | Light | Use |
|---|---|---|
| `surface` | `#EDECEA` | App background, all screens (brand warm grey) |
| `surface-container` | `#E6E3E0` | Filled text fields, tonal buttons |
| `surface-container-high` | `#F7F6F4` | Raised areas, dialogs |
| `dot` | `#CCC8C2` | Background dot texture (1px dots every 28px) |
| `on-surface` | `#111111` | Primary text, names, icons on surface |
| `on-surface-variant` | `#636363` † (was `#888`) | Secondary text, dates, inactive icons |
| `outline` | `#8A8580` | Field underlines, borders |
| `outline-variant` | `#CCC8C2` | Dividers, progress track |
| `primary-container` | `#F5A742` | **Brand orange.** FAB, hero CTA, Save |
| `on-primary-container` | `#683F00` † (was white) | Text/icons on brand orange |
| `primary` | `#875300` | Focus, active field line, text buttons, progress |
| `on-primary` | `#FFFFFF` | Content on `primary` |
| `error` | `#BA1A1A` | Destructive actions |
| `inverse-surface` | `#2B2926` | Snackbar / toast background |
| `inverse-on-surface` | `#F4F2EF` | Snackbar / toast text |
| `inverse-primary` | `#FFB868` | Snackbar action |
| `scrim` | `#000000` | Behind modal content (32%) |
| `camera` | `#000000` | Camera screen |

`primary` comes from Google's Material Color Utilities (Fidelity scheme, seed
`#F5A742`), so it is the same hue family as the brand orange. A dark theme is
generated from the same seed when needed (not in v1).

---

## 3. Typography

**Nunito Sans** (OFL). Weights **400 regular** and **600 semibold** only. No heavier
weights, no outlined text. Bundled with each app (works offline).

Brand type scale (platform mappings in each platform file):

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `headline-medium` | 28 / 36 | 600 | Screen title "Memories" |
| `headline-small` | 24 / 32 | 600 | Detail name, empty-state title |
| `title-large` | 22 / 28 | 600 | Bar titles |
| `title-medium` | 16 / 24 | 600 | Processing label |
| `title-small` | 14 / 20 | 600 | Grid item name |
| `body-large` | 16 / 24 | 400 | Field input, body copy |
| `body-medium` | 14 / 20 | 400 | Descriptions, story, subtitle |
| `body-small` | 12 / 16 | 400 | Grid item date, helper text |
| `label-large` | 14 / 20 | 600 | Buttons, snackbar action |
| `label-medium` | 12 / 16 | 600 | Overline (today's date) |

Sizes scale with the user's system text-size setting where the platform supports it.

---

## 4. Spacing, shape, elevation

- **Spacing (4pt grid):** 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64. Screen side margin 16, grid gutter 16, section gap 24–32.
- **Shape scale:** 4 · 8 · 12 · 16 · 28 · full. Platform files say which shape each component uses.
- **Elevation:** level 0 (flat) · level 1 (raised) · level 3 (floating action).
- **Touch targets:** ≥ 48dp on Android, ≥ 44pt on iOS.

---

## 5. Signature: the cut-out object

The brand's most recognisable element, identical everywhere:
- Object cut out with a transparent background, trimmed to its edges with a ~4% margin.
- **White sticker outline** (~2px) + soft shadow `0 6px 18px rgba(0,0,0,0.12)`.
- Floats directly on `surface` with the dot texture; never placed in a card or box.

---

## 6. Motion intent

Platform curves differ (see platform files), but the intent is shared:
- Screens enter with a gentle fade + small rise; leave faster than they enter.
- Feedback on every tap (ripple on Android, highlight/haptic on iOS).
- No bouncy or decorative motion; respect the system "reduce motion" setting.

---

## 7. Iconography

Each platform uses its native icon family at its default weight:
**Material Symbols Outlined** on Android, **SF Symbols** on iOS. The concept map
(which icon means what) is in [`components.md`](components.md#icon-map).

---

## 8. Accessibility

- Text contrast WCAG AA (guaranteed by the color roles above).
- Every icon-only control has an accessible label.
- Visible focus for keyboard/switch users.
- Reduce-motion and large-text settings respected.
