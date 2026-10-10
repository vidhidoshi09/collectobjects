# Content: voice and copy (all platforms)

**Voice:** warm, calm, brief. Sentence case. Talk to "you". No jargon, no blame,
no emoji, no exclamation marks. Never show technical error text to users.

Every user-facing string comes from this table. Platforms may only change a word
where a platform term differs (e.g. "Settings" is the same on both).

| Key | Where | Copy |
|---|---|---|
| `home.title` | Home title | "Memories" |
| `home.count` | Home subtitle | "1 memory" / "{n} memories" |
| `empty.title` | Empty state | "Keep the little things" |
| `empty.body` | Empty state | "Snap an object that matters to you. We'll cut it out and keep it in your collection." |
| `empty.cta` | Empty state | "Create now" |
| `camera.blocked` | Camera permission off | "Camera is off. Turn it on in Settings, or choose a photo instead." |
| `processing.cutting` | Processing | "Cutting it out…" |
| `processing.setup` | First-time model download | "Getting ready…" + "One-time setup" |
| `review.nameLabel` | Review field | "Name" (placeholder "Name it…") |
| `review.retake` / `review.save` | Review actions | "Retake" · "Save" |
| `memory.untitled` | Default name | "Untitled memory" |
| `detail.storyLabel` | Story field | "Story" (placeholder "Add the story behind it…") |
| `delete.title` / `delete.body` | Delete confirmation | "Delete this memory?" · "This can't be undone." |
| `delete.confirm` / `delete.cancel` | Delete actions | "Delete" / "Cancel" |
| `toast.deleted` | After delete | "Memory deleted" |
| `toast.cutoutFailed` | Cut-out failed | "Couldn't cut this one out, so we kept the full photo." |
| `toast.saveFailed` | Save failed | "Couldn't save. Please try again." |
| `toast.photoUnreadable` | Bad gallery photo | "That photo couldn't be opened. Try another one." |
| `toast.loadFailed` | Load failed | "Couldn't load your memories. Please restart the app." |

**Accessibility labels:** "New memory" (add), "Close", "Delete",
"Choose from gallery", "Take photo", "Retake".
