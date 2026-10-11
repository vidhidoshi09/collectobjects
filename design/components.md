# Components and screens (shared behavior, per-platform build)

Each component is defined once by **what it does**, then **how each platform builds
it**. Android column = what the shipping v1 app uses now. iOS column = the plan for
the native v2. Metrics are in [`foundations.md`](foundations.md) and the platform files.

## Components

| Component | Behavior (all platforms) | Android (v1) | iOS (v2, SwiftUI) |
|---|---|---|---|
| **Screen header** | Today's date, title "collection", count | Brand: `overline` date, `display` serif title, `caption` count | `NavigationStack` large title + subtitle |
| **Add button** | Starts a new object; hidden on the empty state | Brand FAB: 56 orange circle, 32 brown `add`, orange glow | Toolbar `plus` button or bottom glass button (`.glassProminent`, brand tint) |
| **Primary button** (add to collection, add an object) | One per screen, brand orange | Brand pill: 52 high, `accent` bg, `on-accent` `label` text, orange glow | `.buttonStyle(.glassProminent)` tinted brand orange |
| **Secondary button** (retake, remove) | Lower emphasis, icon only | Brand round: 52 circle, `round` bg, 24 `text` icon | `.buttonStyle(.glass)` |
| **Close** (camera, review, detail) | Leaves the screen | Brand: 40 translucent-dark circle (48 target), 16 from top-left, white 24 `close` | System navigation bar / toolbar item (Liquid Glass) |
| **Name field** (review, placard) | Big name in the serif, edits in place | Brand: `headline` serif, no stroke; centred on review, left on the placard; 2px underline (`line` when empty on review, `accent` on focus); a blank name reverts | `TextField` with the serif, `.title` |
| **Placard** (detail) | Gallery-style label under the object: name, "no. 007 · found oct 10, 2026", hairline, the story | Brand: `placard` card, radius 4, `placard` shadow, padding 16/24/24, left-aligned; meta in `overline`; autosaves on change | Same layout in SwiftUI (`RoundedRectangle(cornerRadius: 4)`) |
| **Story field** | Multi-line, grows, inside the placard | Brand: `body`, left-aligned, `accent` underline on focus, placeholder "what's the story?" | `TextField(axis: .vertical)` |
| **Exhibit number** | Permanent "no. 007" per object | Brand: `overline` under the grid name and in the placard meta | Same |
| **Progress** (processing) | Determinate %, label | Brand: 96 orange ring, `title` % inside, `label` text below | `ProgressView(value:)` circular, brand tint |
| **Confirmation** (delete) | Title, body, destructive + cancel | **Native** `MaterialAlertDialogBuilder` via `NativeUi.confirm` (theme colors + brand font) | **Native** `.confirmationDialog` / `.alert` with `role: .destructive` |
| **Choice sheet** | Pick between actions | **Native** M3 `BottomSheetDialog` (add to `NativeUi` when needed) | **Native** `.sheet` with detents / `.confirmationDialog` |
| **Feedback message** | Short non-blocking message, 4s | Brand snackbar: `toast` pill, radius 20, `body` text, centred 24 above the bottom, moves above the FAB / review actions | Small glass toast/banner |
| **Photo picker** | Choose an existing photo | System picker (file input) | `PhotosPicker` |
| **Camera** | Full-bleed preview, shutter, gallery, close | In-app camera (WebView `getUserMedia`), 72 white shutter, 48 gallery circle | `AVCaptureSession` view or system camera |
| **Cut-out** | Remove background on device | ML Kit Subject Segmentation (`BackgroundRemoverPlugin`) | Vision `VNGenerateForegroundInstanceMaskRequest` |
| **Tilt** (detail) | Object tilts with the phone (±12°), holographic glint clipped to its shape; pointer on desktop; off with reduce motion | Brand: CSS 3D transform + masked gradient (`js/tilt.js`, `deviceorientation`) | `CMMotionManager` attitude → `rotation3DEffect`, masked gradient overlay |
| **Reveal / drop** | New cut-out lifts off the page on review (light haptic); saved object drops into the grid (success haptic) | Brand: CSS keyframes (`reveal-lift`, `reveal-outline`, `drop`) + `@capacitor/haptics` | Spring animations + `.sensoryFeedback(.impact(weight: .light))` / `.success` |
| **3D view** | Spin a scanned object, place it in AR | Not available (2.5D tilt instead) | Object Capture scan (LiDAR Pro models) → USDZ in `Model3D` / AR Quick Look |
| **Grid item** | Cut-out + name + exhibit number, square tile | Brand: sticker image, `label` name + white stroke, `overline` "no. 007" (the date lives on the placard) | `LazyVGrid` cell |
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

1. **Home (grid):** header ("oct 11" / "collection" / "4 objects"), 2-column grid of square tiles (name + "no. 007"), newest first, orange FAB. A just-saved object drops in.
2. **Empty state:** three sample cut-outs (croissant, teapot, duck), centre raised; serif title "no objects yet", body, "add an object". FAB hidden.
3. **Camera:** full-bleed preview, close top-left, gallery + shutter at the bottom.
4. **Processing:** orange ring with % inside, "framing it…", optional sub-label.
5. **Review:** close, cut-out that lifts off the page (shrinks, never crops, when the keyboard opens), centred serif name input "what is it?", round retake + "add to collection" pill.
6. **Detail:** close, floating cut-out that tilts with the phone, placard (serif name, "no. 007 · found oct 10, 2026", hairline, the story), round remove (→ native confirmation "remove this object?").
