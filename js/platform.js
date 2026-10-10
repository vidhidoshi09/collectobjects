/* ════════════════════════════════════════════════
   PLATFORM — Capacitor + plugins
   vendor/native.js (a classic script loaded before the app modules)
   puts these on window.Native.
════════════════════════════════════════════════ */
export const { Capacitor, App, Filesystem, Directory, Encoding, Dialog, BackgroundRemover } = window.Native;
export const isNative = Capacitor.isNativePlatform();
