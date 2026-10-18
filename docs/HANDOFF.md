# collectobjects — handoff

Everything we decided, how to work on the app, and what's next. Start here in any new session (or hand this to a new collaborator).

Branch: `claude/blissful-hypatia-ww0fmk` (make it the repo's default branch so the README shows on GitHub).

---

## 1. Where things are

| What | Where |
|---|---|
| Live web preview | https://collectobjects.vercel.app (Vercel project `collectobjects`, Production tracks this branch; every push deploys) |
| Android APK | GitHub → **Releases** → latest (`collectobjects-vX.Y.Z.apk`); every push also leaves an artifact under **Actions** |
| Repo | https://github.com/vidhidoshi09/collectobjects (renamed from `pictureapp`) |
| Portfolio page | `README.md` (feature graphic, 5 screens, the ML Kit explanation, product updates) |
| Design system | `design.md`, `design/` (foundations, components, content, tokens, platforms), `design/research/competitors.md` |
| Every word in the app | `js/copy.js` (mirrors `design/content.md`) |
| What changed and why | `CHANGELOG.md` |
| Store listing, privacy policy, Data safety, graphics | `store/` (screenshots in `store/screenshots/`) |
| Logo files | `assets/logo/` (icon 512/1024/rounded/SVG, white mark); not bundled into the app |

## 2. What the product is

**collectobjects — for your trinkets.** A little home for your trinkets and keepsakes: snap something you love, it's cut out on your phone, and it joins your collection.

- Android app (Capacitor: web UI + native Java plugins). iPhone app in testing (same web UI + Swift twins of the plugins in `ios/App/App/`, Apple Vision cut-out, iOS 17+). Web preview on Vercel.
- **Cut-out:** Google **ML Kit Subject Segmentation**, on the device (`BackgroundRemoverPlugin.java`): confidence mask → soft edges, stray islands removed, cropped. Photos never leave the phone. Not available in browsers, so the web preview keeps the whole photo.
- **Features (v1):** camera + gallery, cut-out reveal (lift, glow, sparkles, haptic), optional name + optional city (`PlacePlugin.java`: coarse location → Android Geocoder → city name only), collection grid (just the objects) with a Liquid Glass tab bar (Collection, Capture), close-up carousel (swipe with haptics, tilt + holographic sheen, Share and Delete with native confirm), shake to tumble (physics pile, Matter.js, haptics from each cut-out via the `Feel` plugin: Core Haptics / Core Motion on iPhone, amplitude vibration on Android), share cards (one object / numbered "My collection" starter pack, 1080×1920, `js/share.js`), daily greeting toast, toasts with icons, on-screen boot error card (if the app fails to start it says why).
- **Privacy:** no account, no ads, no analytics. Data lives in app storage (`objects.json` + `objects/`). Uninstall deletes everything.

## 3. Decisions (and why)

**Name & voice**
- Wordmark always **collectobjects** (one word, lowercase). Tagline "for your trinkets". Home title "Collection".
- Everything the app says is **Sentence case** (buttons, titles, toasts, dialogs); what the person writes stays as typed; dates in small caps; accessibility labels lowercase.
- Don't use "lore", "sticker" (undersells it) or "museum" (too close to competitor Museeum). It's a place to collect your trinkets.

**Visual system (v1)**
- Neutral app with one hue: page `#EDECEA`, fill `#E2DFDB` (tiles, secondary, chips, close), paper `#FAF9F7` (menu, toasts), text `#111`, secondary `#636363`, primary button dark grey `#1F1F1F`.
- Hue = orange `#F5A742` → maroon `#8E1B2D` mix. Only in: the soft hue wash behind the screens (orange from the top, maroon at the bottom; replaced the dots), soft glow behind the object (save + close-up, with sparkles), lightly on the empty screen, progress ring, toast icons, caret. Switch with `<html data-hue="orange|maroon">`.
- Type: **Bricolage Grotesque** (titles, object names) + **Instrument Sans** (body, buttons, dates). Native dialogs use Instrument Sans.
- Shape: radius 16 for everything tappable; circles only for close and chips; one shadow (menu/toast).
- Cut-outs: soft shadow only (the white outline was removed); real cut-outs never multiply into the page.
- Count and dates share the overline style ("4 OBJECTS", "OCT 11").

**Screens**
- Empty: header + samples + "Start collecting" / "A little home for your trinkets and keepsakes." + dark + tile.
- Grid: just the objects (no names or dates), newest first; a Liquid Glass tab bar floats at the bottom (Collection, Capture). The add tile only stays on the empty screen.
- Save screen: centred group (object, name "Name it (optional)", no auto keyboard, city chip, retake + "Add to collection").
- Close-up: a carousel of the collection: name and "oct 11 · london" on top, the object in the middle with its neighbours peeking in, swipe with a haptic tick; Share and Delete (asks first) as 44px glass buttons below. No story, no page dots. Opening: the other tiles scatter, the object flies in, the name rises.

**Icon**
- The "c into o" single line, paper white, tilted 40°, bottom-right, on a grainy burgundy wash with an orange glow and cream haze, plus a sparkle. Generated for adaptive (round/squircle/themed), legacy, Play (512). Many alternatives were tried (sparkle, flower "co", croissant, ribbon, dreamy/blurred, separate "c o"); this clean version was chosen.

**Rejected on purpose:** mascot (no role without AI/voice), cork-board look, dark mode (later), tags/folders/maps (feature weight is what makes Trinket heavy).

## 4. How to work

**Run locally (web):** `npm ci && npm start` → http://localhost:8000

**Android on your Mac:**
```
git pull
npm ci
npm run sync
npm run open:android
```
In Android Studio: File → Sync Project with Gradle Files → Build → Clean Project → uninstall the old app → ▶ Run. If the screen is blank, wait 5 s for the white error card, or check Logcat filtered by `Capacitor`.

**If `git pull` says "Repository not found"** (repo renamed/private): `git remote set-url origin https://github.com/vidhidoshi09/collectobjects.git`, and sign in with `brew install gh && gh auth login && gh auth setup-git`.

**APK without Android Studio:** Releases → latest → download the `.apk` on the phone and open it. Or Actions → newest green run → `collectobjects-debug-apk` → unzip → install `app-debug.apk` (allow unknown apps; Samsung: turn off Auto Blocker while installing).

**iPhone on your Mac:** `npm ci && npm run sync:ios && npm run open:ios` → in Xcode, App target → Signing & Capabilities → pick your Team (free Apple ID) → plug in the iPhone → ▶ Run. First time on the phone: Settings → General → VPN & Device Management → trust; turn on Developer Mode. Free signing lasts 7 days; TestFlight/App Store need the $99/year Apple Developer Program. The Simulator has no Vision cut-out (photo stays whole).

**Release for testers (GitHub, free):** bump `versionName`/`versionCode` in `android/app/build.gradle`, then `git tag vX.Y.Z && git push origin vX.Y.Z` (or Actions → Android APK → Run workflow → type the version); the Action publishes a GitHub Release with the APK. Each CI build is signed with a fresh debug key, so testers must uninstall the old version (which deletes their objects) before installing a new one, until we sign with a fixed key.

**Release (Play Store):** see README "Release build": create the upload key (never commit it or share the password), `android/keystore.properties`, `npm run release` → `.aab`. Bump `versionCode` each upload.

**Web deploys:** `vercel.json` runs `npm run build` → `www/`. Production tracks this branch, so pushing = live.

**Working style that worked:** one step at a time; show a picture before building UI; mock-ups first, then code; keep the UI polish for when the flow is settled; screenshots of the whole app after design changes.

## 5. Launch plan (GTM)

0. ☑ Free download for testers and the portfolio: GitHub Release `v1.0.0` with the APK. Play's free "personal apps" (Oct 2026) only cover apps built in Google AI Studio, private to your own device, so a public Play launch still needs the $25 developer account.

1. ☐ Test the APK on a real phone end to end (cut-out, city, share sheet into Instagram story, haptics, back button). The blank-screen report from earlier was never diagnosed; the error card will show the cause if it recurs.
2. ☐ Play Console account ($25 + identity check; can take days, start early).
3. ☐ Upload key + `npm run release`.
4. ☐ Host the privacy policy (`store/privacy-policy.md`; fill name, email, date) on a public page (Notion/Google Sites, or GitHub Pages while the repo is public).
5. ☐ Store listing from `store/listing.md`; screenshots `store/screenshots/` (plan to redo: 4 images, a title image with objects + logo and no phone, fewer teapots, no "sticker" wording; references: CapWords' scattered objects, Trinket's "Keep the little things"); feature graphic `store/feature-graphic.png`.
6. ☐ Data safety (`store/data-safety.md`; verify the ML Kit and Geocoder notes against Google's guidance).
7. ☐ Closed test: 12+ testers for 14 days, then apply for production.
8. ☐ Launch posts: Product Hunt/Peerlist, short videos ("my desk starter pack" made with the share card), and the portfolio case study.

## 6. Backlog

- Gallery imports keep the photo's original date (EXIF).
- Backup / export (zip to Drive).
- "On this day" toast.
- Camera framing guide ("one object, fully in frame").
- Edit affordance on the close-up (pencil when the name is empty).
- **Web cut-out (optional):** a Vercel function `api/remove-bg.js` that holds a remove.bg key in env `REMOVE_BG_API_KEY` (size `preview` is free), checks the request comes from our own site, posts `image_file_b64` to `https://api.remove.bg/v1.0/removebg`, and returns the PNG as base64; the web client calls it only when not native and quietly keeps the photo if it returns 404/501. The old remove.bg key is visible in git history (commit `d3e3c66`): revoke it in the remove.bg dashboard.
- iPhone v1 (Capacitor) is built; to do: test on a real iPhone (cut-out, city, share, haptics, camera permission), then TestFlight ($99/year). Native v2 later: SwiftUI + Liquid Glass, Apple Vision cut-outs (`VNGenerateForegroundInstanceMaskRequest`), 3D scans with Object Capture on LiDAR iPhones.
- Dark mode (same palette flipped: deep cola background, cream text, the same glow).

## 7. Competitors (summary)

Trinket (closest: receipts, map, wall; heavy onboarding), Kept (editorial calm, "pool", containers), Museeum, Loot (share as link), Shuffles (collage), CapWords (original visual reference). Our edge: Android first, first object in ~10 s, private by default, lowercase-warm voice → Sentence case system, reveal + tilt + share cards. Details: `design/research/competitors.md`.
