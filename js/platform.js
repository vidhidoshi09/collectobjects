/* ════════════════════════════════════════════════
   PLATFORM — Capacitor + plugins
   vendor/native.js (a classic script loaded before the app modules)
   puts these on window.Native.
════════════════════════════════════════════════ */
export const { Capacitor, App, Filesystem, Directory, Encoding, Haptics, BackgroundRemover, NativeUi, Place, Share, Feel, Matter } = window.Native;
export const isNative = Capacitor.isNativePlatform();
