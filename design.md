# Memories — Design System

The single source of truth for how Memories looks, feels and talks, on every
platform. The details live in [`design/`](design/); this page is the map.

## How it's organised

Brand owns the screens; the native platform owns system moments.

| Layer | What it is | Where |
|---|---|---|
| **1. Brand screens** | The look of every screen: warm dotted background, cut-out stickers, heavy names with a white stroke, round orange actions, Rounded icons, soft press. Color, type, spacing, motion, voice. Same on every platform. | [`design/foundations.md`](design/foundations.md), [`design/tokens.json`](design/tokens.json), [`design/content.md`](design/content.md) |
| **2. Native system moments** | Dialogs, sheets, pickers, permission prompts, launch screen: the platform's own components, themed with brand colors and font, never restyled. | [`design/components.md`](design/components.md) (which component is native) |
| **3. Platform files** | How each platform builds both layers: metrics, native theme, icons, token sync. | [`design/platforms/android.md`](design/platforms/android.md), [`design/platforms/ios.md`](design/platforms/ios.md) (planned) |

## Platforms

| Platform | Status | Built with |
|---|---|---|
| Android | Launching (v1) | Capacitor: brand screens in the web UI + native Android dialogs (Material 3 theme with brand colors and Nunito Sans) |
| Web preview | Dev only | Same web UI in a browser; no on-device cut-out, `confirm()` instead of the native dialog |
| iOS | Planned (v2) | Fully native SwiftUI with Liquid Glass, separate codebase, same brand layer |

## Changing the design

1. **Change a value** (color, size, spacing, duration): edit `design/tokens.json`
   first, then mirror it into each platform's implementation (listed in
   `tokens.json` → `$implementations`). Platforms must never invent their own values.
2. **Change words**: edit `design/content.md`. Every user-facing string comes from there.
3. **Add a component**: add a row to `design/components.md` with its behavior and
   one column per platform (what native component it uses there). If a platform
   has a native equivalent, use it.
4. **Platform-only rules** (metrics, gestures, haptics) go in that platform's file.
