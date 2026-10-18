# Changelog: collectobjects

What changed, when, and why. Newest first. (Formerly "Memories".)

## Tab bar, Liquid Glass, objects that shine

- **Soft hue wash** replaces the dotted background: orange light from the top, a hint of maroon at the bottom, no pattern.
- **Tab bar:** a Liquid Glass capsule floating over the collection, on Android and iPhone: **Collection** and **Capture** (opens the camera). The grey add tile left the grid; the empty screen keeps its own.
- **Liquid Glass buttons:** close, share, ⋯ and retake are see-through glass with a bright rim.
- **Objects shine:** no name or date under the grid tiles (both live in the close-up), rows sit closer, and cut-outs lost the white outline (soft shadow only, in the share cards too).
- **Naming is optional:** the keyboard no longer opens by itself, the field says "Name it (optional)", and an unnamed object shows no "untitled object" label anywhere. A name can be cleared in the close-up.
- **Share on the close-up:** its own tertiary button next to ⋯ (just the icon, the modern box-and-arrow share icon; the menu keeps Delete). The header share button for the collection card was removed.

## iPhone app (in testing)

- Added the **iOS app** (`ios/`), the same web UI through Capacitor, so collectobjects can run on iPhone.
- Swift twins of the three Android plugins: **cut-out with Apple Vision** on the phone (iOS 17+; same soft edges, stray-piece removal and crop as Android), **city** from approximate location and Apple's geocoder (city name only), and the native **Delete** confirmation.
- iPhone permission texts in the app's voice, the collectobjects icon, a plain launch screen in the page colour, portrait only.
- `npm run sync:ios` / `npm run open:ios`.

## v1.0.0: first GitHub Release

- Pushing a version tag (`v1.0.0`, …) now publishes a **GitHub Release** with the APK attached (`collectobjects-v1.0.0.apk`), so testers and portfolio visitors can download it on their phone without unzipping an Actions artifact.

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

**From review (round 2)**
- Delete moved into a **⋯ menu** on the detail screen, so it's never one stray tap away.
- Save screen back to the original centred layout; the name reads as a title (no form underline).
- **Story when saving:** an optional "what's the story?" right under the name.
- **City (optional):** "add city" on the save screen; camera photos fill it in once location is allowed. Approximate location only, city name only, shown as "oct 11 · london".
- **Buttons in Sentence case** ("Add to collection", "Delete", "Keep it"); "remove" is now "delete"; everything else stays lowercase.
- **Saved toast:** "added to your collection" as a new object drops in.
- No date above "collection" on the home screen.
- **Add tile** replaces the orange round button: a quiet square + first in the grid, from the first object on.
- Add tile is a smaller square, and the empty screen uses it too (header back, no orange button): "Start collecting" / "Snap a trinket, cut it out, keep its story."
- **Design system v1:** Sentence case for everything the app says; surfaces bg → fill → paper; radius 16 (full for close and chips); one shadow; orange only for primary, progress and the caret. Toasts are paper cards with brown icons; close is a fill circle (dark only over the camera); city chip is a fill pill; flat primary button (no glow); headline 24.
- **Neutral app with a hue:** dark grey main button, light grey secondary; colour (an orange-to-maroon mix, or orange / maroon via `data-hue`) only in the dot texture, a soft glow behind your object (blooming in on save, with twinkling sparkles) and lightly on the empty screen, the progress ring, toast icons and the caret. Cut-outs no longer multiply into the page, so their white outline stays white over the glow.
- The object count is set like the dates (small caps).
- **Share cards** (the growth wedge): Share in an object's ⋯ menu makes a story-sized card (cut-out on the glow with sparkles, name, date, city, story, wordmark); the share button on the collection header makes a numbered "My collection" starter-pack card. Android share sheet via `@capacitor/share`; Web Share or a download in a browser.
- **New app icon:** one line that loops "c" into "o" (tilted so it reads "co"), in paper on a grainy burgundy wash with an orange glow and cream haze, plus a sparkle. Adaptive icon (round, squircle, themed/monochrome), legacy icons, Play Store icon and a new feature graphic.
- The + on the first screen is dark grey, the main action; the grid leaves room so a toast never traps the last row; the cutting-out screen shows your photo, blurred, behind the ring.
- First screen: header back, "Start collecting" / "A little home for your trinkets and keepsakes.", and the + under it.
- **Toasts** in Sentence case with a small icon (sunrise/sun/moon greetings, check on save).
- The detail date is just the date ("oct 11"), no "found".

**Planned next**
- Gallery imports keep the photo's date; backup/export; "On this day".
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
