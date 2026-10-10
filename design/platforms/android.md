# Android (v1): Material 3 with the brand layer

The Android app is a Capacitor app: screens are a web UI drawn to **Material 3**
spec, and platform components (dialogs, sheets, pickers, permission prompts,
launch screen) are **real native Android** components themed with the brand.

## Brand → Material 3 mapping

- **Colors:** the brand roles in [`../foundations.md`](../foundations.md#2-color-roles) *are* M3 color roles (same names).
- **Type:** brand type tokens *are* the M3 type scale (`headline-medium` … `label-medium`), set in Nunito Sans 400/600.
- **Shape:** extra-small 4 · small 8 · medium 12 · large 16 · extra-large 28 · full.

## In-app components (web UI, `css/app.css`)

| Component | Metrics |
|---|---|
| Top app bar | 64dp tall, `surface`; leading/trailing standard icon buttons; title `title-large` |
| Standard icon button | 40dp circle container (state layer only), 48dp touch target, 24dp icon, `on-surface-variant` |
| FAB | 56×56, radius 16 (large), `primary-container`, icon `on-primary-container`, elevation 3, 16dp from edges + safe area |
| Filled button | Height 40, radius full, padding 24 (16 with icon), `label-large` |
| Hero CTA | Height 56, radius full, 24dp leading icon |
| Tonal button | `surface-container` bg, `on-surface` label |
| Filled text field | Height 56, `surface-container`, radius 4 4 0 0, 1dp `on-surface-variant` line → 2dp `primary` on focus, floating label |
| Circular progress | Determinate, 48dp, 4dp stroke, 4dp track gap (M3 Expressive) |
| Snackbar | `inverse-surface`, radius 4, 16dp margins, auto-dismiss 4s |
| Camera icon buttons | White icon on 40% black circle |

**Icons:** Material Symbols Outlined, weight 400 (package ships optical size 48 only; shown at 24/20/48dp). Inlined as an SVG sprite in `index.html`.

**State and motion:** ripple + state layer on everything tappable (pressed/focus 10%, hover 8%); no scale-on-press.

| Token | Curve | Duration | Use |
|---|---|---|---|
| `emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 400ms | Entering |
| `emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 200ms | Leaving |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | 300ms | Small changes |
| `short` | `standard` | 150ms | State layers |

Overlays enter with fade + 32dp rise and leave with a fade; reduce-motion → fade only.

## Native components (Android theme)

| File | What it does |
|---|---|
| `res/values/colors.xml` | Brand color roles (`md_*`) |
| `res/values/styles.xml` | `AppTheme` = `Theme.Material3.Light.NoActionBar` with brand color roles + surface containers, Nunito Sans as `fontFamily`, and M3 text appearances (headline/title/body/label) in Nunito Sans |
| `res/font/nunito_sans.xml` | Font family: `nunito_sans_regular.ttf` (400), `nunito_sans_semibold.ttf` (600) |
| `res/values(-v28)/styles.xml` → `AppTheme.AlertDialog` | Brands the WebView's own alert dialogs (not used by the app) |
| `AppTheme.NoActionBarLaunch` | Launch screen: `surface` background + app icon |
| `NativeUiPlugin.java` | `NativeUi.confirm(...)` → `MaterialAlertDialogBuilder` (theme-styled, destructive label in `error`). Add `BottomSheetDialog` here when a screen needs a choice sheet. |

Because every native component reads the theme, **new native components get the
brand colors and font automatically**; never style them per call.

## Token sync

Values are mirrored by hand today in `css/app.css` (`:root`) and
`res/values/colors.xml` from [`../tokens.json`](../tokens.json). Planned: a small
build script that generates both (and the iOS asset catalog) from `tokens.json`.
