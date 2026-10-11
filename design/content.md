# Content: voice and copy (all platforms)

**Name:** the wordmark is **collectobjects**: one word, always lowercase, everywhere
(app, launcher, store, docs). The lockup is **collectobjects — for your trinkets**;
the tagline "for your trinkets" goes with it on the feature graphic and in the store.
The home screen's title is "collection". One thing in it is an **object**. Every
object has a **story**: why it matters.

## Voice

Lowercase, warm, playful, brief. A friend who keeps a little archive of your
things and takes them as seriously as you do.

- **Always lowercase**, also titles and accessibility labels. **Button labels are
  Sentence case** ("Add to collection", "Delete", "Keep it"), and so are **toasts**,
  each with a small icon ("Added to your collection"). Names the person
  types are kept exactly as typed.
- **Short.** One idea per message. Questions are fine ("what is it?").
- **Playful, never cringe.** No slang, no "bestie", no emoji, no exclamation marks,
  no ALL CAPS in the words (small caps in the overline style are typography, not copy).
- **The archive vocabulary, lightly:** story, found, collection. Don't
  say "museum" (a competitor's name is close to it).
- **No blame, no jargon.** Errors say what happened and what to do next, often as a
  gentle question ("try again?"). Never show technical error text.
- Talk to "you".

## Where the words live

Every user-facing string comes from **`js/copy.js`** (Android web UI), which
mirrors this table. To rename the app or the noun, change `BRAND`, `ITEM` /
`ITEMS` / `AN_ITEM` and `COLLECTION` there (`TAGLINE` holds the lockup's tagline); every string is built from them,
and `applyCopy()` fills the static markup at startup. Outside the web UI,
also rename `capacitor.config.json` `appName`, `android/.../res/values/strings.xml`
(`app_name`, `title_activity_main`), `<title>` in `index.html`, `store/` and the docs.
Platforms may only change a word where a platform term differs.

| Key | Where | Copy |
|---|---|---|
| `appName` | Window title, launcher, store | "collectobjects" |
| `TAGLINE` | Feature graphic, store, docs | "for your trinkets" |
| `home.title` | Home title (serif) | "collection" |
| `home.count` | Home subtitle | "1 object" / "{n} objects" |
| `empty.title` / `empty.body` | Empty state | "Start collecting" · "Snap a trinket, cut it out, keep its story." (echoes the Play Store line) |
| `camera.blocked` | Camera permission off | "camera's off. turn it on in settings, or pick a photo instead." |
| `processing.cutting` | Processing | "framing it…" |
| `processing.setup` | First-time model download | "getting ready…" + "one-time setup" |
| `review.name` | Review field | label "name", placeholder "what is it?" |
| `review.storyPlaceholder` | Review story | "what's the story? (optional)" |
| `review.city` | City chip | "Add city" · "finding city…" · the city; a11y "remove london" |
| `item.dateLine` | Detail date line | "oct 11", or "oct 11 · london" (same year rule) |
| `toast.cityDenied` / `toast.cityFailed` | City lookup | "Location's off for collectobjects. You can turn it on in Settings" · "Couldn't find your city right now" (error icon) |
| `review.retake` / `review.save` | Review actions | "retake" (a11y) · "Add to collection" |
| `item.untitled` | Default name | "untitled object" |
| `item.date` | Grid date | "oct 11"; with the year when it isn't this year: "mar 3, 2025" |
| `greeting` | Toast on the first open of each day (phone's local time, no location) | 5–12 "Good morning" (sunrise) · 12–17 "Good afternoon" (sun) · 17–22 "Good evening" (moon) · otherwise "Up late?" (moon) |
| `detail.story` | Story field | label "story", placeholder "what's the story?" |
| `delete.title` / `delete.body` | Delete confirmation | "delete this object?" · "this can't be undone." |
| `delete.confirm` / `delete.cancel` | Delete actions | "Delete" (destructive) / "Keep it" |
| `detail.delete` | ⋯ menu item | "Delete" |
| `toast.added` | After saving | "Added to your collection" (check) |
| `toast.deleted` | After delete | "Object deleted" (delete) |
| `toast.cutoutFailed` | Cut-out failed | "Couldn't cut this one out, so we kept the whole photo" (error) |
| `toast.saveFailed` | Save failed | "Couldn't save. Try again?" (error) |
| `toast.photoUnreadable` | Bad gallery photo | "That photo didn't open. Try another one?" (error) |
| `toast.loadFailed` | Load failed | "Couldn't load your objects. Restart the app?" (error) |

**Accessibility labels:** "add an object" (add), "close", "more" (⋯), "Delete" (menu item),
"choose from gallery", "take photo", "retake", "name", "story". A grid tile reads
"{name}, oct 11".

**Dates:** records keep the date as saved ("October 10, 2026", en-US) so the data
format never changes; it is shown lowercase with a short month ("oct 10, 2026").
