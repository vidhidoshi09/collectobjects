# Components and screens (shared behavior, per-platform build)

Each component is defined once by **what it does**, then **how each platform builds
it**. Android column = what the shipping v1 app uses now. iOS column = the plan for
the native v2. Metrics are in [`foundations.md`](foundations.md) and the platform files.

## Components

| Component | Behavior (all platforms) | Android (v1) | iOS (v2, SwiftUI) |
|---|---|---|---|
| **Screen header** | Today's date, title "Memories", count | Brand: `caption` date + count, `display` title | `NavigationStack` large title + subtitle |
| **Add button** | Starts a new memory; hidden on the empty state | Brand FAB: 56 orange circle, 32 brown `add`, orange glow | Toolbar `plus` button or bottom glass button (`.glassProminent`, brand tint) |
| **Primary button** (Save, Create now) | One per screen, brand orange | Brand pill: 52 high, `accent` bg, `on-accent` `label` text, orange glow | `.buttonStyle(.glassProminent)` tinted brand orange |
| **Secondary button** (Retake, Delete) | Lower emphasis, icon only | Brand round: 52 circle, `round` bg, 24 `text` icon | `.buttonStyle(.glass)` |
| **Close** (camera, review, detail) | Leaves the screen | Brand: 40 translucent-dark circle (48 target), 16 from top-left, white 24 `close` | System navigation bar / toolbar item (Liquid Glass) |
| **Name field** (review, detail) | Big centred name, edits in place | Brand: `headline` + white stroke; 2px underline (`line` when empty on review, `accent` on focus) | `TextField` styled as title |
| **Story field** | Centred, multi-line, grows | Brand: `body`, centred, `accent` underline on focus | `TextField(axis: .vertical)` |
| **Progress** (processing) | Determinate %, label | Brand: 96 orange ring, `title` % inside, `label` text below | `ProgressView(value:)` circular, brand tint |
| **Confirmation** (delete) | Title, body, destructive + cancel | **Native** `MaterialAlertDialogBuilder` via `NativeUi.confirm` (theme colors + Nunito Sans) | **Native** `.confirmationDialog` / `.alert` with `role: .destructive` |
| **Choice sheet** | Pick between actions | **Native** M3 `BottomSheetDialog` (add to `NativeUi` when needed) | **Native** `.sheet` with detents / `.confirmationDialog` |
| **Feedback message** | Short non-blocking message, 4s | Brand snackbar: `toast` pill, radius 20, `body` text, centred 24 above the bottom, moves above the FAB / review actions | Small glass toast/banner |
| **Photo picker** | Choose an existing photo | System picker (file input) | `PhotosPicker` |
| **Camera** | Full-bleed preview, shutter, gallery, close | In-app camera (WebView `getUserMedia`), 72 white shutter, 48 gallery circle | `AVCaptureSession` view or system camera |
| **Cut-out** | Remove background on device | ML Kit Subject Segmentation (`BackgroundRemoverPlugin`) | Vision `VNGenerateForegroundInstanceMaskRequest` |
| **3D view** | Spin a scanned object, place it in AR | Not available (2.5D tilt instead) | Object Capture scan (LiDAR Pro models) → USDZ in `Model3D` / AR Quick Look |
| **Grid item** | Cut-out + name + date, square tile | Brand: sticker image, `label` name + white stroke, `caption` date | `LazyVGrid` cell |
| **Empty state** | 3 sample objects (centre raised), title, body, primary CTA | Brand | Same layout in SwiftUI |

## Icon map

| Meaning | Android (Material Symbols Rounded) | iOS (SF Symbols) |
|---|---|---|
| Add | `add` | `plus` |
| Close | `close` | `xmark` |
| Gallery | `photo_library` | `photo.on.rectangle` |
| Retake | `refresh` | `arrow.counterclockwise` |
| Delete | `delete` | `trash` |
| Camera | `photo_camera` | `camera` |

## Screens

1. **Home (grid):** header, 2-column grid of square tiles, orange FAB.
2. **Empty state:** three sample cut-outs (croissant, teapot, duck), centre raised; title, body, "Create now". FAB hidden.
3. **Camera:** full-bleed preview, close top-left, gallery + shutter at the bottom.
4. **Processing:** orange ring with % inside, label, optional sub-label.
5. **Review:** close, cut-out (shrinks, never crops, when the keyboard opens), big name input, round Retake + Save pill.
6. **Detail:** close, cut-out, editable name, date, story, round Delete (→ native confirmation).
