# Android (v1): brand screens + native system moments

The Android app is a Capacitor app. **Screens** are a web UI in the brand look
([`../foundations.md`](../foundations.md), `css/app.css`). **System moments**
(confirmation dialogs, sheets, pickers, permission prompts, launch screen) are
**real native Android** components, themed with the brand.

## Brand screens (web UI, `css/app.css`)

Every value comes from a `:root` token mirrored from [`../tokens.json`](../tokens.json);
rules use no raw values (except the fixed sticker-outline offsets).

| Component | Metrics |
|---|---|
| Close | 40 circle, 45% black + 6px blur, white 24 icon; 48 touch target; 16 from top/left + safe area |
| FAB | 56 circle, `accent`, 32 icon in `on-accent`, orange glow; 16 from the right edge of the column, 24 from the bottom + safe area |
| Primary button | 52 high pill, padding 32, `label` type, `on-accent` on `accent`, orange glow |
| Secondary round button | 52 circle, `round` bg, 24 `text` icon |
| Name field | `headline` + 4px white stroke, centred, 2px underline |
| Progress | 96 ring, 6% stroke, `dot` track, `accent` bar with round cap, `title` % inside |
| Snackbar | `toast` bg, `on-toast` `body` text, radius 20, padding 12/24, centred, 24 above the bottom + safe area; moves up above the FAB or review actions; 4s |
| Camera | 72 white shutter with soft halo; 48 gallery circle (15% white) |

**Icons:** Material Symbols Rounded, weight 400, fill 0 (`@material-symbols/svg-400`), inlined as an SVG sprite in `index.html`.

**Feedback and motion:** scale to 0.95 on press (200ms ease), no ripple. Overlays
fade (250ms); snackbar fades + rises 8px. Reduce motion → fades only.

## Native system moments (Android theme)

| File | What it does |
|---|---|
| `res/values/colors.xml` | Material 3 color roles from the brand (`md_*`, `tokens.json` → `native`) |
| `res/values/styles.xml` | `AppTheme` = `Theme.Material3.Light.NoActionBar` with those roles, Nunito Sans as `fontFamily`, M3 text appearances in Nunito Sans |
| `res/font/nunito_sans.xml` | `nunito_sans_regular.ttf` (400), `nunito_sans_semibold.ttf` (600) |
| `res/values(-v28)/styles.xml` → `AppTheme.AlertDialog` | Brands the WebView's own alert dialogs (not used by the app) |
| `AppTheme.NoActionBarLaunch` | Launch screen: `bg` + app icon |
| `NativeUiPlugin.java` | `NativeUi.confirm(...)` → `MaterialAlertDialogBuilder` (theme-styled, destructive label in `error`). Used for delete; a desktop browser falls back to `confirm()`. Add `BottomSheetDialog` here when a screen needs a choice sheet. |

Every native component reads the theme, so **new native components get the brand
colors and font automatically**; never style them per call.

## Token sync

Values are mirrored by hand today into `css/app.css` (`:root`) and
`res/values/colors.xml` from [`../tokens.json`](../tokens.json). Planned: a small
build script that generates both (and the iOS asset catalog) from `tokens.json`.
