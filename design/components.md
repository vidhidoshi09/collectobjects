# Components and screens (shared behavior, per-platform build)

Each component is defined once by **what it does**, then **how each platform builds
it**. Android column = what the shipping v1 app uses now. iOS column = the plan for
the native v2. Metrics are in [`foundations.md`](foundations.md) and the platform files.

## Components

| Component | Behavior (all platforms) | Android (v1) | iOS (v2, SwiftUI) |
|---|---|---|---|
| **Screen header** | Title "collection", count | Brand: `display` title, `caption` count (no date) | `NavigationStack` large title + subtitle |
| **Add tile** | Starts a new object; first in the grid (top-left), from the first object on; the empty state uses its orange "Add an object" button instead | Brand: square tile like an object's, `round` bg, radius 20, 32 `add`, "Add" in `text-secondary` under it | Toolbar `plus` button or bottom glass button (`.glassProminent`, brand tint) |
| **Primary button** (Add to collection, Add an object) | One per screen, brand orange | Brand pill: 52 high, `accent` bg, `on-accent` `label` text, orange glow | `.buttonStyle(.glassProminent)` tinted brand orange |
| **Secondary button** (retake) | Lower emphasis, icon only | Brand round: 52 circle, `round` bg, 24 `text` icon | `.buttonStyle(.glass)` |
| **Close** (camera, review, detail) | Leaves the screen | Brand: 40 translucent-dark circle (48 target), 16 from top-left, white 24 `close` | System navigation bar / toolbar item (Liquid Glass) |
| **Name field** (review, detail) | Big name in the display font, edits in place | Brand: `headline` (Bricolage), no stroke; centred; reads as a title, not a form: no underline on review, orange caret; 2px `accent` underline only while editing on detail; a blank name reverts | `TextField` in the display font, `.title` |
| **Story field** (review, detail) | Optional story, grows with its text | Brand: `body`, centred; "what's the story? (optional)" on review, "what's the story?" on detail | Multi-line `TextField(axis: .vertical)` |
| **More menu** (detail) | Less common actions (delete) behind ⋯ | Brand: ⋯ is the close button's twin, top-right; menu is a `surface` card that hugs its items, radius 16, `menu` shadow, 48px rows; Delete in `danger`; closes on outside tap, back or Escape | `Menu` on a toolbar `ellipsis` button, `Button(role: .destructive)` |
| **City chip** (review) | Optional city the object was found in | Brand: `caption` text + 18px `location_on`, dashed underline when empty ("Add city"), the city once found (tap to take it off); Android only | `CLGeocoder` reverse geocode, `locality` only |
| **Story field** | Multi-line, grows, under the date | Brand: `body` (Instrument Sans), centred, `accent` underline on focus, placeholder "what's the story?" | `TextField(axis: .vertical)` |
| **Progress** (processing) | Determinate %, label | Brand: 96 orange ring, `title` % inside, `label` text below | `ProgressView(value:)` circular, brand tint |
| **Confirmation** (delete) | Title, body, destructive + cancel | **Native** `MaterialAlertDialogBuilder` via `NativeUi.confirm` (theme colors + brand font) | **Native** `.confirmationDialog` / `.alert` with `role: .destructive` |
| **Choice sheet** | Pick between actions | **Native** M3 `BottomSheetDialog` (add to `NativeUi` when needed) | **Native** `.sheet` with detents / `.confirmationDialog` |
| **Feedback message** | Short non-blocking message, 4s | Brand snackbar: `toast` pill, radius 20, `body` text, optional 18 icon in `toast-action` orange, Sentence-case text; centred 24 above the bottom, moves above the review actions | Small glass toast/banner |
| **Photo picker** | Choose an existing photo | System picker (file input) | `PhotosPicker` |
| **Camera** | Full-bleed preview, shutter, gallery, close | In-app camera (WebView `getUserMedia`), 72 white shutter, 48 gallery circle | `AVCaptureSession` view or system camera |
| **Cut-out** | Remove background on device | ML Kit Subject Segmentation (`BackgroundRemoverPlugin`) | Vision `VNGenerateForegroundInstanceMaskRequest` |
| **Tilt** (detail) | Object tilts with the phone (±12°), holographic glint clipped to its shape; pointer on desktop; off with reduce motion | Brand: CSS 3D transform + masked gradient (`js/tilt.js`, `deviceorientation`) | `CMMotionManager` attitude → `rotation3DEffect`, masked gradient overlay |
| **Reveal / drop** | New cut-out lifts off the page on review (light haptic); saved object drops into the grid (success haptic) | Brand: CSS keyframes (`reveal-lift`, `reveal-outline`, `drop`) + `@capacitor/haptics` | Spring animations + `.sensoryFeedback(.impact(weight: .light))` / `.success` |
| **3D view** | Spin a scanned object, place it in AR | Not available (2.5D tilt instead) | Object Capture scan (LiDAR Pro models) → USDZ in `Model3D` / AR Quick Look |
| **Grid item** | Cut-out + name + date, square tile | Brand: sticker image, `name` (Bricolage 800) + white stroke, `overline` date "oct 11" (year only when not this year) | `LazyVGrid` cell |
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

1. **Home (grid):** header ("collection" / "4 objects"), 2-column grid of square tiles (name + "oct 11"): the add tile first, then newest first. A just-saved object drops in.
2. **Empty state:** three sample cut-outs (croissant, teapot, duck), centre raised; title "start collecting", body, "Add an object", centred on the screen. No header (no "collection", no count) until the first object.
3. **Camera:** full-bleed preview, close top-left, gallery + shutter at the bottom.
4. **Processing:** orange ring with % inside, "framing it…", optional sub-label.
5. **Review:** close; centred as one group: cut-out that lifts off the page (shrinks, never crops, when the keyboard opens), name "what is it?", optional story, city chip, round retake + "Add to collection" pill.
6. **Detail:** close, floating cut-out that tilts with the phone, then open on the page, centred: name, the date ("oct 11", or "oct 11 · london"), the story (no box, no number). ⋯ top-right → menu → Delete (→ native confirmation "delete this object?").
