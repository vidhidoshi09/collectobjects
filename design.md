# Memories — Design System

The single source of truth for how Memories looks, feels and talks, on every
platform. The details live in [`design/`](design/); this page is the map.

## How it's organised

The system has three layers, like apps that feel both branded and native:

| Layer | What it is | Same on every platform? | Where |
|---|---|---|---|
| **1. Brand** | Color roles, typeface, spacing, shape, the cut-out object look, motion intent, voice and copy | ✅ Yes | [`design/foundations.md`](design/foundations.md), [`design/content.md`](design/content.md), [`design/tokens.json`](design/tokens.json) |
| **2. Platform** | How the brand is expressed with each platform's own components and conventions | ❌ Per platform | [`design/platforms/android.md`](design/platforms/android.md) (Material 3), [`design/platforms/ios.md`](design/platforms/ios.md) (Liquid Glass, planned) |
| **3. Components & screens** | What each component and screen does, with its implementation on each platform | Behavior shared, build per platform | [`design/components.md`](design/components.md) |

**Rule of thumb:** brand where it's ours, native where it's the platform's.
Native components (dialogs, sheets, pickers, share sheet) are never restyled
beyond what the platform theme allows (brand colors and font).

## Platforms

| Platform | Status | Built with |
|---|---|---|
| Android | Launching (v1) | Capacitor: web UI drawn to Material 3 spec + native Android components (Material 3 theme) |
| Web preview | Dev only | Same web UI in a browser; no on-device cut-out |
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
