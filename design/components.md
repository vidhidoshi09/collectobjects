# Components and screens (shared behavior, per-platform build)

Each component is defined once by **what it does**, then **how each platform builds
it**. Android column = what the shipping v1 app uses now. iOS column = the plan for
the native v2. Metrics are in [`foundations.md`](foundations.md) and the platform files.

## Components

| Component | Behavior (all platforms) | Android (v1) | iOS (v2, SwiftUI) |
|---|---|---|---|
| **Screen header** | Title "Collection", count | Brand: `display` title, count in `overline` small caps like the dates (no date) | `NavigationStack` large title + subtitle |
| **Add tile** | Starts a new object; always first in the grid (top-left), on the empty screen too | Brand: small square (56% of a cell) centred where a cut-out would sit, `round` bg, radius 16, 24 `add`; no label (a11y "add an object") | Toolbar `plus` button or bottom glass button (`.glassProminent`, brand tint) |
| **Primary button** (Add to collection, Add an object) | One per screen, brand orange | Brand pill: 52 high, `accent` bg, `on-accent` `label` text, orange glow | `.buttonStyle(.glassProminent)` tinted brand orange |
| **Secondary button** (retake) | Lower emphasis, icon only | Brand round: 52 circle, `round` bg, 24 `text` icon | `.buttonStyle(.glass)` |
| **Close** (camera, review, detail) | Leaves the screen | Brand: 40 translucent-dark circle (48 target), 16 from top-left, white 24 `close` | System navigation bar / toolbar item (Liquid Glass) |
| **Name field** (review, detail) | Big name in the display font, edits in place | Brand: `headline` (Bricolage), no stroke; centred; reads as a title, not a form: no underline on review, orange caret; 2px `accent` underline only while editing on detail; a blank name reverts | `TextField` in the display font, `.title` |
| **Story field** (review, detail) | Optional story, grows with its text | Brand: `body`, centred; "what's the story? (optional)" on review, "what's the story?" on detail | Multi-line `TextField(axis: .vertical)` |
| **Share card** | Story-sized image (1080×1920) of one object or the collection | Canvas (`js/share.js`): page colour + tinted dots, hue glow, white-outlined cut-out(s), sparkles; object: name (Bricolage 80), date · city (small caps), story (4 lines); collection: "My collection", count, up to 9 numbered objects + legend; wordmark + tagline at the foot. `@capacitor/share` sheet | `ImageRenderer` + `ShareLink` |
| **More menu** (detail) | Share, then Delete, behind ⋯ | Brand: ⋯ is the close button's twin, top-right; menu is a `surface` card that hugs its items, radius 16, `menu` shadow, 48px rows; Delete in `danger`; closes on outside tap, back or Escape | `Menu` on a toolbar `ellipsis` button, `Button(role: .destructive)` |
| **City chip** (review) | Optional city the object was found in | Brand: `fill` pill, 40 high, `caption` text + 18 `location_on`; "Add city" in `text-secondary`, the city in `text` once found (tap to take it off); Android only | `CLGeocoder` reverse geocode, `locality` only |
| **Story field** | Multi-line, grows, under the date | Brand: `body` (Instrument Sans), centred, `accent` underline on focus, placeholder "what's the story?" | `TextField(axis: .vertical)` |
| **Progress** (processing) | Determinate %, label | Brand: 96 orange ring, `title` % inside, `label` text below | `ProgressView(value:)` circular, brand tint |
| **Confirmation** (delete) | Title, body, destructive + cancel | **Native** `MaterialAlertDialogBuilder` via `NativeUi.confirm` (theme colors + brand font) | **Native** `.confirmationDialog` / `.alert` with `role: .destructive` |
| **Choice sheet** | Pick between actions | **Native** M3 `BottomSheetDialog` (add to `NativeUi` when needed) | **Native** `.sheet` with detents / `.confirmationDialog` |
| **Feedback message** | Short non-blocking message, 4s | Brand toast: `paper` card, radius 16, the one shadow, `body` text, 18 icon in `on-accent` brown, Sentence-case text; centred 24 above the bottom, moves above the review actions | Small glass toast/banner |
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
2. **Empty state:** header ("collection" / "0 objects") and the add tile as usual; below, centred: three sample cut-outs, "Start collecting", "Snap a trinket, cut it out, keep its story." No orange button.
3. **Camera:** full-bleed preview, close top-left, gallery + shutter at the bottom.
4. **Processing:** orange ring with % inside, "framing it…", optional sub-label.
5. **Review:** close; centred as one group: cut-out that lifts off the page (shrinks, never crops, when the keyboard opens), name "what is it?", optional story, city chip, round retake + "Add to collection" pill.
6. **Detail:** close, floating cut-out that tilts with the phone, then open on the page, centred: name, the date ("oct 11", or "oct 11 · london"), the story (no box, no number). ⋯ top-right → menu → Delete (→ native confirmation "delete this object?").
