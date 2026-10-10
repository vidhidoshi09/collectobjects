# iOS (v2, planned): native SwiftUI with Liquid Glass

A separate, fully native app, written in SwiftUI. It shares the **brand layer**
([`../foundations.md`](../foundations.md), [`../content.md`](../content.md),
[`../tokens.json`](../tokens.json)) and the component *behaviors*
([`../components.md`](../components.md)), and uses Apple's own components and
Liquid Glass for everything else.

## Brand → iOS mapping

**Colors:** generate an asset catalog (`Assets.xcassets`) color set per role from
`tokens.json` (`surface`, `onSurface`, `primaryContainer`, …). The brand orange is
the app `tint`, so system controls (buttons, toggles, progress, glass tints) pick it up.

**Type:** register Nunito Sans (400, 600) in the app and use it through Dynamic Type
so it scales with the user's text size:
`Font.custom("NunitoSans-Regular", size: 16, relativeTo: .body)`.

| Brand token | iOS text style it scales with |
|---|---|
| `headline-medium` (28) | `.title` (large-title nav uses the system's own size) |
| `headline-small` (24) | `.title2` |
| `title-large` (22) | `.title3` |
| `title-medium` (16) | `.headline` |
| `title-small` (14) | `.subheadline` |
| `body-large` (16) | `.body` |
| `body-medium` (14) | `.callout` |
| `body-small` (12) | `.footnote` |
| `label-large` (14) | `.subheadline` (buttons) |
| `label-medium` (12) | `.caption` |

**Spacing / shape:** same 4pt grid and shape scale; touch targets ≥ 44pt.

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
| Feedback | Haptics (`.sensoryFeedback`) instead of ripples. |
| Messages | Small toast/banner (iOS has no snackbar). |
| Motion | System springs (`.smooth`, `.snappy`) instead of Material curves. |
| Cut-out | Vision foreground-mask request (on-device, no download). |

## Shared beyond design

Keep the **data format** identical (`memories.json` with `id`, `name`, `date`,
`file`, `note`; photos as PNG cut-outs) so a future backup or export/import works
across both apps.
