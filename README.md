# Memories

A minimal app for collecting everyday objects as memories. It runs as a web app (`index.html`), and Capacitor packages the same app as an Android app (`android/`).

## Run locally

```bash
npm install
npm start   # serves the app at http://localhost:8000 and reloads on save
```

### Live reload on the Android emulator
Start the emulator, then run these in two terminals:

```bash
npm start            # terminal 1: local server
npm run dev:android  # terminal 2: installs the app pointed at the local server
```

Saving `index.html` or a file in `css/` or `js/` now refreshes the app on the emulator. Press Ctrl+C in terminal 2 when done, then run `npm run sync` before building a normal APK.

## Android app

### Get an APK without installing anything
Each push runs the **Android APK** GitHub Action. Open the run under the repo's **Actions** tab, download the `memories-debug-apk` artifact, unzip it, and install `app-debug.apk` on your phone. To install it, allow "Install unknown apps" for your browser or file manager.

### Build locally
Requirements: Node 20+, JDK 21, Android Studio (with the Android SDK).

```bash
npm install
npm run sync          # copy the web app (index.html, css/, js/, assets/) into the Android project
npm run open:android  # open in Android Studio, then press Run
# or build the APK from the command line:
npm run apk           # -> android/app/build/outputs/apk/debug/app-debug.apk
```

After editing `index.html`, `css/`, `js/` or `assets/`, run `npm run sync` again so the Android project picks up the change.

### Release build for the Play Store
1. Create an upload key once (keep it and its passwords safe, outside git):
   `keytool -genkeypair -v -keystore ~/memories-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
2. Create `android/keystore.properties` (git-ignored):
   ```
   storeFile=/Users/<you>/memories-upload.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```
3. `npm run release` → `android/app/build/outputs/bundle/release/app-release.aab`, which you upload to Play Console.
4. Bump `versionCode` (and `versionName`) in `android/app/build.gradle` for every upload.

Store listing text, privacy policy, Data safety answers and graphics are in `store/`.

### Notes
- App ID: `com.vidhidoshi.memories` (set in `capacitor.config.json`).
- The camera uses the `CAMERA` permission. Android asks for it the first time you tap **+**.
- The hardware back button closes the open screen. On the grid, it exits the app.
- Memories are saved as files in the app's private storage on the device (`memories.json` plus `photos/`). Uninstalling the app deletes them.
- Background removal runs on the device with Google ML Kit (`BackgroundRemoverPlugin.java`); no API key or internet service. The model is a Google Play services module: Play Store installs download it with the app, otherwise it downloads on first use. In a desktop browser (`npm start`) the photo is kept as is.

## Project structure

- `index.html`: markup and the inline icon sprite; loads `vendor/native.js`, then `js/main.js`.
- `css/app.css`: all styles; tokens follow `design/tokens.json` (design system: `design.md`).
- `js/`: the app as ES modules.
  - `main.js`: event wiring, Android back button, startup.
  - `platform.js`: Capacitor and plugins (App, Filesystem, BackgroundRemover, NativeUi) from `window.Native`.
  - `state.js`: shared mutable state (memories, camera stream, pending photo).
  - `storage.js`: files on the device, legacy migration, photo URLs.
  - `grid.js`: grid, detail view, editing, delete.
  - `camera.js`: camera, capture, gallery import, the capture flow.
  - `background.js`: background removal and the progress ring.
  - `review.js`: review and save.
  - `overlays.js`, `format.js`: overlay show/hide, date and HTML helpers.
  - `snackbar.js`, `textfield.js`: snackbar messages, the growing story field.
- `src/native.js`: source of `vendor/native.js` (bundled by `npm run vendor`).
- `assets/`: images. `android/`: the Capacitor Android project. `www/`: build output.
