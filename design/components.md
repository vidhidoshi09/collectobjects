# Components and screens (shared behavior, per-platform build)

Each component is defined once by **what it does**, then **how each platform builds
it**. Android column = the shipping v1 app. iOS column = the plan for the native v2.
Detailed metrics are in the platform files.

## Components

| Component | Behavior (all platforms) | Android (v1) | iOS (v2, SwiftUI) |
|---|---|---|---|
| **Screen header** | Today's date overline, title "Memories", count subtitle | In-app header, M3 type roles | `NavigationStack` large title + subtitle |
| **Add button** | Starts a new memory; hidden on the empty state | M3 FAB (56, radius 16, `primary-container`) | Toolbar `plus` button or bottom glass button (`.glassProminent`, brand tint) |
| **Primary button** (Save, Create now) | One per screen, brand orange | M3 filled button / large hero button | `.buttonStyle(.glassProminent)` tinted brand orange |
| **Secondary button** (Retake) | Lower emphasis | M3 tonal button | `.buttonStyle(.glass)` |
| **Top bar** (review, detail) | Back/close + actions | M3 top app bar, in-app | System navigation bar (Liquid Glass) with toolbar items |
| **Text field** (Name, Story) | Label, placeholder, multi-line for Story | M3 filled text field, floating label | Native `TextField` / `TextField(axis: .vertical)` in a form-style group |
| **Editable title** (detail name) | Reads as text, edits in place | `headline-small` field, underline on focus | `TextField` styled as title |
| **Progress** (processing) | Determinate %, label | M3 circular progress with track gap | `ProgressView(value:)` circular, brand tint |
| **Confirmation** (delete) | Title, body, destructive + cancel | **Native** `MaterialAlertDialogBuilder` via `NativeUi.confirm` (brand font + colors from theme) | **Native** `.confirmationDialog` / `.alert` with `role: .destructive` (system font, by Apple's design) |
| **Choice sheet** | Pick between actions | **Native** M3 `BottomSheetDialog` (add to `NativeUi` when needed) | **Native** `.sheet` with detents / `.confirmationDialog` |
| **Feedback message** | Short non-blocking message | M3 snackbar (in-app) | Small glass toast/banner (no system snackbar on iOS) |
| **Photo picker** | Choose an existing photo | System picker (file input) | `PhotosPicker` |
| **Camera** | Full-bleed preview, shutter, gallery, close | In-app camera (WebView `getUserMedia`) | `AVCaptureSession` view or system camera |
| **Cut-out** | Remove background on device | ML Kit Subject Segmentation (`BackgroundRemoverPlugin`) | Vision `VNGenerateForegroundInstanceMaskRequest` |
| **Grid item** | Cut-out + name + date | In-app, M3 type roles | `LazyVGrid` cell |
| **Empty state** | 3 sample objects (centre raised), title, body, primary CTA | In-app | Same layout in SwiftUI |

## Icon map

| Meaning | Android (Material Symbols Outlined) | iOS (SF Symbols) |
|---|---|---|
| Add | `add` | `plus` |
| Back | `arrow_back` | system back (`chevron.backward`) |
| Close | `close` | `xmark` |
| Gallery | `photo_library` | `photo.on.rectangle` |
| Retake | `refresh` | `arrow.counterclockwise` |
| Delete | `delete` | `trash` |
| Camera | `photo_camera` | `camera` |
| Edit | `edit` | `pencil` |

## Screens

1. **Home (grid):** header, 2-column grid, add button.
2. **Empty state:** three sample cut-outs (croissant, teapot, duck), centre raised; title, body, "Create now". Add button hidden.
3. **Camera:** full-bleed preview, close top-left, gallery + shutter at the bottom.
4. **Processing:** centred progress + label + %.
5. **Review:** top bar (close), cut-out, Name field, Retake + Save.
6. **Detail:** top bar (back, delete), cut-out, editable name, date, Story field.
