// Bundled into vendor/native.js (see scripts/build-vendor.js) so the plain-script
// index.html can reach Capacitor's native features via window.Native.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

// Implemented in android/app/src/main/java/com/memories/app/BackgroundRemoverPlugin.java
const BackgroundRemover = registerPlugin('BackgroundRemover');
// Implemented in android/app/src/main/java/com/memories/app/NativeUiPlugin.java
const NativeUi = registerPlugin('NativeUi');

window.Native = { Capacitor, App, Filesystem, Directory, Encoding, BackgroundRemover, NativeUi };
