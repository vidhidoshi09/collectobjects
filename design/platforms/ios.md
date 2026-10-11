# iOS (v2, planned): native SwiftUI with Liquid Glass

A separate, fully native app, written in SwiftUI. It shares the **brand layer**
([`../foundations.md`](../foundations.md), [`../content.md`](../content.md),
[`../tokens.json`](../tokens.json)) and the component *behaviors*
([`../components.md`](../components.md)), and uses Apple's own components and
Liquid Glass for everything else.

## Brand → iOS mapping

**Colors:** generate an asset catalog (`Assets.xcassets`) color set per role from
`tokens.json` (`bg`, `text`, `accent`, …). The brand orange is
the app `tint`, so system controls (buttons, toggles, progress, glass tints) pick it up.

**Type:** register Bricolage Grotesque (titles, object names) and Instrument Sans (body,
buttons) and use them through Dynamic Type so it scales with the user's text size:
`Font.custom("BricolageGrotesque", size: 30, relativeTo: .title).weight(.bold)`. Grid
names keep the white sticker stroke (draw the text twice: stroked white behind,
filled on top). The overline uses `.smallCaps()` + tracking.

| Brand token | iOS text style it scales with |
|---|---|
| `display` (serif 44, 400) | `.largeTitle` (home title "collection") |
| `headline` (serif 34, 400) | `.title` |
| `title` (22, 900) | `.title3` |
| `overline` (14, 400, small caps) | `.footnote` |
| `label` (15, 900) | `.subheadline` (buttons, grid names) |
| `body` (14, 400) | `.callout` |
| `caption` (13, 400) | `.footnote` |

**Spacing / shape:** same 4pt grid; round controls; touch targets ≥ 44pt.

**Icons:** SF Symbols, regular weight, matching the icon map in `components.md`.

## Liquid Glass (Apple's own, not imitated)

- Navigation bars, toolbars, tab bars and sheets get Liquid Glass automatically from the system; don't redraw them.
- Brand buttons: `.buttonStyle(.glassProminent)` tinted brand orange for the primary action, `.buttonStyle(.glass)` for secondary.
- Custom floating controls (e.g. the add button over the grid) use `.glassEffect()`; group nearby ones in a `GlassEffectContainer`.
- Glass needs content behind it: the dot texture and cut-outs scrolling under bars are what make it read well.

## What will differ from Android (on purpose)

| Topic | iOS behavior |
|---|---|
| Alerts / confirmation dialogs | System font only (Apple doesn't allow restyling); brand shows only via tint. Use custom `.sheet`s for branded moments. |
| Back navigation | Swipe-from-edge + system back button; no in-app back arrow. |
| Feedback | Haptics (`.sensoryFeedback`): light impact on the reveal, success on save, like Android. |
| Tilt | `CMMotionManager` device attitude → `rotation3DEffect` (±12°), glint masked to the object. |
| Messages | Small toast/banner (iOS has no snackbar). |
| Motion | System springs (`.smooth`, `.snappy`) instead of CSS ease. |
| Cut-out | Vision foreground-mask request (on-device, no download). |

## Signature iOS feature: 3D scan (v2)

- **3D scan of an object** with Apple **Object Capture** (`ObjectCaptureSession`, on-device), producing a USDZ model the user can spin and zoom in the detail view and place in their room with AR Quick Look.
- Requires **LiDAR**: iPhone 12 Pro and later **Pro / Pro Max** models (and iPad Pro). Check `ObjectCaptureSession.isSupported`; on other iPhones, offer the 2.5D holographic tilt instead.
- The flat cut-out stays the grid thumbnail; a small 3D badge marks scanned pieces.
- Store the model next to the photo (`objects/<id>.usdz`) and add an optional `model` field to the object record.

## Shared beyond design

Keep the **data format** identical (`objects.json` with `id`, `no`, `name`, `date`,
`file`, `note`; photos as PNG cut-outs in `objects/`) so a future backup or
export/import works across both apps. `no` is the permanent exhibit number
(highest + 1 at save, never reused); `date` is stored as "October 10, 2026" (en-US)
and only formatted for display.
