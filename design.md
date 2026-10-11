# collectobjects — Design System

The single source of truth for how **collectobjects — for your trinkets** looks,
feels and talks, on every platform. The app is a little archive of the things you
keep: each object is cut out like a sticker and carries its story.

**What makes it ours:** the brand orange, the lowercase voice and the motion (the
reveal, the drop, the holographic tilt). The serif and the dotted off-white page
are shared with others in the category, so the serif stays modest: display titles only. The details live in [`design/`](design/); this page is the map.

## How it's organised

Brand owns the screens; the native platform owns system moments.

| Layer | What it is | Where |
|---|---|---|
| **1. Brand screens** | The look of every screen: warm dotted background, cut-out stickers, Bricolage Grotesque for titles and object names with Instrument Sans for reading, heavy grid names with a white stroke, dates without the year, round orange actions, Rounded icons, soft press, the reveal/drop/tilt moments. Color, type, spacing, motion, voice. Same on every platform. | [`design/foundations.md`](design/foundations.md), [`design/tokens.json`](design/tokens.json), [`design/content.md`](design/content.md) |
| **2. Native system moments** | Dialogs, sheets, pickers, permission prompts, launch screen: the platform's own components, themed with brand colors and font, never restyled. | [`design/components.md`](design/components.md) (which component is native) |
| **3. Platform files** | How each platform builds both layers: metrics, native theme, icons, token sync. | [`design/platforms/android.md`](design/platforms/android.md), [`design/platforms/ios.md`](design/platforms/ios.md) (planned) |

## Platforms

| Platform | Status | Built with |
|---|---|---|
| Android | Launching (v1) | Capacitor: brand screens in the web UI + native Android dialogs (Material 3 theme with brand colors and Instrument Sans) |
| Web preview | Dev only | Same web UI in a browser; no on-device cut-out, `confirm()` instead of the native dialog |
| iOS | Planned (v2) | Fully native SwiftUI with Liquid Glass, separate codebase, same brand layer |

## Changing the design

1. **Change a value** (color, size, spacing, duration): edit `design/tokens.json`
   first, then mirror it into each platform's implementation (listed in
   `tokens.json` → `$implementations`). Platforms must never invent their own values.
2. **Change words**: edit `design/content.md`, then `js/copy.js` (every user-facing string in the web UI comes from there; renaming the app or the noun is a change to its constants).
3. **Add a component**: add a row to `design/components.md` with its behavior and
   one column per platform (what native component it uses there). If a platform
   has a native equivalent, use it.
4. **Platform-only rules** (metrics, gestures, haptics) go in that platform's file.
