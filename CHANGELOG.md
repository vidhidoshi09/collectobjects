# Changelog: collectobjects

What changed, when, and why. Newest first. (Formerly "Memories".)

## Unreleased (in progress)

**Identity**
- Renamed to **collectobjects** (lockup *collectobjects — for your trinkets*); home screen title "collection".
- App ID changes to `com.vidhidoshi.collectobjects` (not yet published, so this is the last free moment).
- Lowercase, warm Gen Z voice across all copy ("add an object", "what's the story?", "found oct 10").
- Privacy policy rewritten in the brand voice, headline promise first: *"your things stay on your phone. we never see them."*

**Small wins (being built)**
- **The reveal:** cut-outs lift off the page with a light haptic.
- **The drop:** new objects settle into the collection with a success haptic.
- Holographic tilt on the detail screen (moves with the phone).
- Storage renamed to `objects.json` / `objects/`, with automatic migration.

**From review (latest)**
- Fonts: **Bricolage Grotesque** for titles and object names, **Instrument Sans** for body, buttons and dates (more readable); native dialogs use Instrument Sans.
- Empty state says **"start collecting"** and is centred on the screen.
- Smaller "collection" title.
- Grid shows the **date** ("oct 11"), with the year only for older objects; exhibit numbers are kept in the data but not shown.
- Detail screen is open: name, "found oct 11", story. No box, no number.
- **Daily greeting** toast on the first open of the day (good morning / afternoon / evening / up late?), from the phone's clock, no location.

**Planned next**
- Camera framing guide ("one object, fully in frame") for cleaner cut-outs.
- Gallery imports keep the photo's original date.
- Shareable collection card for stories (the Gen Z wedge).
- iPhone v2: native SwiftUI, Liquid Glass, Apple Vision cut-outs, 3D scan on LiDAR Pro models.

---

## 2026-10-11

- Design docs: planned the iPhone **3D scan** (Apple Object Capture, LiDAR Pro models).

## 2026-10-10: from web prototype to Android app

**Design direction**
- Restored the original brand look after a Material 3 experiment: floating close circles, centred detail, round orange FAB, heavy sticker names, Rounded icons, press-scale feedback.
- Kept from the experiment: native Android delete dialog (Material 3 builder, brand font and colors), accessible contrast (dark brown on orange, `#636363` secondary text), bundled offline font, tokenized CSS.
- Consistency pass: one close / primary / round button style, unified type scale and dates, one sticker treatment, 4px spacing grid, ≥48px touch targets.
- Design system restructured: `design.md` + `design/` (foundations, content, components, tokens.json, Android and iOS platform files) for "brand screens + native system moments".

**From real-phone testing**
- Grid tiles are strict squares, so tall objects no longer break rows.
- Review screen: the photo shrinks (never crops) when the keyboard opens.
- Camera: removed Android's default video "play" placeholder.
- Soft cut-out edges from ML Kit's confidence mask; stray fragments dropped.

**Features**
- Add from gallery; editable name; a story for every object.
- New installs start with a designed empty state (croissant, teapot, duck + CTA).
- Back camera no longer saves mirrored photos.
- Snackbars instead of browser alerts.
- App icon (placeholder disco ball) and branded launch screen.

**Platform and infrastructure**
- Packaged as a native Android app with Capacitor.
- On-device background removal (Google ML Kit) replaced the paid remove.bg API and its exposed key.
- Photos saved as files in app storage, with automatic migration from browser storage.
- Android back button closes screens; app exits from the grid.
- Code split from one `index.html` into `css/` and `js/` modules.
- GitHub Actions builds a debug APK on every push.
- Play Store prep: release signing, store listing, Data safety answers, feature graphic.

## 2026-05-24 → 2026-05-29: web prototype

- V1 single-file web app: grid, camera capture, review, detail view, empty state.
- CapWords-inspired visual system: warm grey dotted background, sticker cut-outs, orange accent, Nunito Sans.
- Explored background removal: @imgly, MediaPipe, TensorFlow BodyPix, then the remove.bg API.
- Scissors cut animation on the processing screen.
- Bug fixes: sample data mutation, delete, empty state.
