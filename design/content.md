# Content: voice and copy (all platforms)

**Name:** the wordmark is **collectobjects**: one word, always lowercase, everywhere
(app, launcher, store, docs). The lockup is **collectobjects — for your trinkets**;
the tagline "for your trinkets" goes with it on the feature graphic and in the store.
The home screen's title is "collection". One thing in it is an **object**. Every
object has a **story**: why it matters.

## Voice

Lowercase, warm, playful, brief. A friend who keeps a little archive of your
things and takes them as seriously as you do.

- **Always lowercase**, also buttons, titles and accessibility labels. Names the
  person types are kept exactly as typed.
- **Short.** One idea per message. Questions are fine ("what is it?").
- **Playful, never cringe.** No slang, no "bestie", no emoji, no exclamation marks,
  no ALL CAPS in the words (small caps in the overline style are typography, not copy).
- **The archive vocabulary, lightly:** story, found, no. 007, collection. Don't
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
| `home.date` | Home overline | "oct 11" (lowercase short month + day) |
| `home.count` | Home subtitle | "1 object" / "{n} objects" |
| `empty.title` | Empty state (serif) | "no objects yet" |
| `empty.body` | Empty state | "every little thing has a story. add your first." |
| `empty.cta` | Empty state | "add an object" |
| `camera.blocked` | Camera permission off | "camera's off. turn it on in settings, or pick a photo instead." |
| `processing.cutting` | Processing | "framing it…" |
| `processing.setup` | First-time model download | "getting ready…" + "one-time setup" |
| `review.name` | Review field | label "name", placeholder "what is it?" |
| `review.retake` / `review.save` | Review actions | "retake" · "add to collection" |
| `item.untitled` | Default name | "untitled object" |
| `item.no` | Exhibit number (grid, placard) | "no. 007" (3 digits, zero-padded) |
| `item.meta` | Placard meta line | "no. 007 · found oct 10, 2026" |
| `detail.story` | Story field | label "story", placeholder "what's the story?" |
| `remove.title` / `remove.body` | Delete confirmation | "remove this object?" · "this can't be undone." |
| `remove.confirm` / `remove.cancel` | Delete actions | "remove" (destructive) / "keep it" |
| `toast.removed` | After delete | "object removed" |
| `toast.cutoutFailed` | Cut-out failed | "couldn't cut this one out, so we kept the whole photo." |
| `toast.saveFailed` | Save failed | "couldn't save. try again?" |
| `toast.photoUnreadable` | Bad gallery photo | "that photo didn't open. try another one?" |
| `toast.loadFailed` | Load failed | "couldn't load your objects. restart the app?" |

**Accessibility labels:** "add an object" (add), "close", "remove" (delete),
"choose from gallery", "take photo", "retake", "name", "story". A grid tile reads
"{name}, no. 007".

**Dates:** records keep the date as saved ("October 10, 2026", en-US) so the data
format never changes; it is shown lowercase with a short month ("oct 10, 2026").
