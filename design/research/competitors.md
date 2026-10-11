# Competitive landscape

Several apps independently built "photograph your objects, cut them out, keep
them". That validates the need. These notes are what we learn from each, and
where Collect Objects is different.

## The apps

| App | Platform | Positioning | Notable |
|---|---|---|---|
| **Trinket: Object Archive** | iOS | "Private keepsake archive" | Closest to us. Receipts per object, trips, map pins, freeform Wall, iCloud sync |
| **Museeum: Your Private Museum** | iOS | "Sticker museum" | Mature (v3.5+), tags, long stories (2,000 chars) |
| **Kept.: Everyday Object Journal** | iOS | Object journal | Live Photo objects |
| **Loot** | iOS | "Collect your favorite things in real life" | Auto-naming, categories, share a collection as a web link |
| **Shuffles by Pinterest** | iOS / Android | Collage/moodboard from cut-outs | Inspiration, not your own things |
| **CapWords** | iOS / Android | Language learning via object photos | Our original visual reference |

## Trinket: detailed teardown (closest competitor)

**What they do well (learn from it)**
- **A metaphor for saving:** a POS machine prints a **receipt** for each object ("TR-0002 · DONE. FILED"). Saving becomes a moment.
- **Tactile, premium objects:** illustrated 3D-looking keepsakes; handwritten logotype; dark warm UI.
- **The camera coaches you:** framing box, "center the whole object", "ready to scan", zoom dial. Better input → better cut-outs.
- **Gallery import reads date & GPS** from the photo.
- **Cut-out quality:** clean edges thanks to Apple's Vision framework.
- **Privacy as a brand moment:** policy written in their voice, headline promise first ("your things stay yours").

**What we avoid**
- **Feature weight:** Wall canvas, pin bank, trips, map, tags, materials, voice memos, avatar, iCloud. Powerful but heavy.
- **Long onboarding:** 4 intro screens + privacy screen + a 5-step guided tour before you've added anything.
- **Receipt / archive metaphor:** ours must read as a *museum label*, not a receipt.

## Kept.: teardown

**What they do well (learn from it)**
- **Editorial calm:** serif "Kept." wordmark, typewriter body copy ("Capture… bring it… let it stay."), lots of off-white space.
- **A "Pool" instead of a grid:** objects pile up loosely, like things on a table. Physical, not a database.
- **Collections as real containers:** *Pegboard*, *Grandma's* (a cookie tin), *Flipped* (an envelope). The container carries emotion.
- **Flip to see the back:** objects turn like a polaroid; the story lives on the back.
- **Reveal over the source:** the cut-out floats above a heavily blurred version of the original photo.
- **Trip collage:** a dense flat-lay of everything from one place, very shareable.

**Watch out:** Kept already owns *off-white dotted background + serif wordmark + white-outlined cut-outs*. Our distinct cues must be **the brand orange, the lowercase voice, motion (lift-off, holographic tilt) and the sharing wedge**, not the dots-and-serif look.

## Where Collect Objects wins

| They | We |
|---|---|
| iPhone only (as far as we know) | **Android first**, iPhone v2 |
| Long onboarding | **First object in ~10 seconds**; the empty state is the onboarding |
| Private archive, travel and maps | **Identity**: "the stories behind your things", shareable collection card |
| Receipt animation | **Lift-off reveal + holographic tilt**, then **3D scans** on iPhone Pro |
| Feature-rich | **Simple, fast, focused** |
| Adult, nostalgic tone | **Lowercase Gen Z voice** |

## Learnings adopted

- [ ] Camera framing guide ("one object, fully in frame")
- [ ] Gallery import keeps the photo's original date
- [x] Privacy policy in our voice, promise first
- [ ] One privacy line on the empty state ("everything stays on your phone")
- [ ] iPhone: Apple Vision cut-outs (quality parity)
- [ ] Reveal over a blurred version of the original photo (Kept)
- [ ] Later: collections as containers / eras ("grandma's tin", "uni era")
