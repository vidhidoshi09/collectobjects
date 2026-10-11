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
| Add tile | First grid cell: square, `round` bg, radius 20, inset like an object's image, 32 `add` icon; "Add" under it in the name position |
| Primary button | 52 high pill, padding 32, `label` type, `on-accent` on `accent`, orange glow |
| Secondary round button | 52 circle, `round` bg, 24 `text` icon |
| Name field | `headline` (Bricolage 26, 700), no stroke, centred; 2px underline |
| Detail text | centred, max 340, no box: name → 4 → `overline` "oct 11" (· city) → 16 → story |
| Grid tile | square image, 8 → `name` + 4px white stroke, 4 → `overline` date ("oct 11") |
| Progress | 96 ring, 6% stroke, `dot` track, `accent` bar with round cap, `title` % inside |
| Snackbar | `toast` bg, `on-toast` `body` text, radius 20, padding 12/24, centred, 24 above the bottom + safe area; optional 18 icon; moves up above the review actions; 4s |
| Camera | 72 white shutter with soft halo; 48 gallery circle (15% white) |

**Fonts:** `assets/fonts/` holds Bricolage Grotesque (variable 200–800) and Instrument
Sans (variable 400–700), latin + latin-ext, from `@fontsource-variable/*`, with their
OFL licenses, loaded with `@font-face` in `css/app.css`.

**Words:** every string comes from `js/copy.js` ([`../content.md`](../content.md));
static markup carries `data-copy*` attributes that `applyCopy()` fills at startup.

**Icons:** Material Symbols Rounded, weight 400, fill 0 (`@material-symbols/svg-400`), inlined as an SVG sprite in `index.html`.

**Feedback and motion:** scale to 0.95 on press (200ms ease), no ripple. Overlays
fade (250ms); snackbar fades + rises 8px. The reveal (`#review-img.is-revealing`,
keyframes `reveal-lift` + `reveal-outline`) and the drop (`.card--dropped`) are CSS
keyframes restarted by `js/motion.js`. The tilt (`js/tilt.js`) reads
`deviceorientation` (pointer on desktop), lerps every animation frame, writes
`transform` + `--tilt-x/-y` on `.tilt` (perspective on `.detail-img-wrap`); the
`.sheen` overlay is masked with the object's own image (`--sheen-mask`). Listeners
are removed when the detail closes. Reduce motion → fades only, no tilt or sheen.

**Haptics:** `@capacitor/haptics` via `js/haptics.js`, Android only, never throws:
`Haptics.impact({ style: 'LIGHT' })` when the reveal starts,
`Haptics.notification({ type: 'SUCCESS' })` when the drop starts.

## Native system moments (Android theme)

| File | What it does |
|---|---|
| `res/values/colors.xml` | Material 3 color roles from the brand (`md_*`, `tokens.json` → `native`) |
| `res/values/styles.xml` | `AppTheme` = `Theme.Material3.Light.NoActionBar` with those roles, the brand font as `fontFamily`, M3 text appearances in the brand font |
| `res/font/brand_font.xml` | Instrument Sans `brand_font_regular.ttf` (400), `brand_font_semibold.ttf` (600) for native dialogs and sheets. Swap these two files to change the native font. |
| `res/values(-v28)/styles.xml` → `AppTheme.AlertDialog` | Brands the WebView's own alert dialogs (not used by the app) |
| `AppTheme.NoActionBarLaunch` | Launch screen: `bg` + app icon |
| `res/values/strings.xml` | `app_name` / `title_activity_main`: "collectobjects" (launcher; the one-word lowercase wordmark). |
| `NativeUiPlugin.java` | `NativeUi.confirm(...)` → `MaterialAlertDialogBuilder` (theme-styled, destructive label in `error`). Used for delete ("delete this object?", "Delete" / "Keep it"); a desktop browser falls back to `confirm()`. Add `BottomSheetDialog` here when a screen needs a choice sheet. |

Every native component reads the theme, so **new native components get the brand
colors and font automatically**; never style them per call.

## Token sync

Values are mirrored by hand today into `css/app.css` (`:root`) and
`res/values/colors.xml` from [`../tokens.json`](../tokens.json). Planned: a small
build script that generates both (and the iOS asset catalog) from `tokens.json`.
