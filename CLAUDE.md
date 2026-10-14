# collectobjects — notes for agents

Read **`docs/HANDOFF.md`** first: product, decisions, how to run/build/deploy, launch plan, backlog.

## Ground rules
- Owner: Vidhi, a product designer (not a developer). Explain steps **one at a time**, plainly; show a picture/mock-up before building UI, then apply to code, then send screenshots of the whole app.
- Work on branch `claude/blissful-hypatia-ww0fmk` (Vercel Production tracks it, so every push goes live at https://collectobjects.vercel.app; GitHub Actions builds the APK).
- Never commit the upload keystore, `android/keystore.properties` or any API key; never ask for the keystore password.
- Copy: every user-facing word lives in `js/copy.js`. Sentence case for everything the app says; the wordmark is always `collectobjects`; never "lore", "sticker" or "museum".
- Design tokens are CSS variables at the top of `css/app.css` (source of truth: `design/tokens.json`, `design.md`). Keep the system: neutral UI, one orange→maroon hue in a few places, radius 16, one shadow, Bricolage Grotesque + Instrument Sans.
- After web changes: `npm run build` (Vercel) / `npm run sync` (Android). New Capacitor plugins also need `npm run sync` committed (`android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`).
- Verify in a browser (`npm start`, http://localhost:8000) with Playwright; the browser preview has no on-device cut-out (photos stay whole), no city, no haptics.
- Keep `README.md` (portfolio page), `CHANGELOG.md` and `design/` in step with changes.
