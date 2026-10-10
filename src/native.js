// Bundled into vendor/native.js (see scripts/build-vendor.js) so the plain-script
// index.html can reach Capacitor's native features via window.Native.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Dialog } from '@capacitor/dialog';

// Implemented in android/app/src/main/java/com/memories/app/BackgroundRemoverPlugin.java
const BackgroundRemover = registerPlugin('BackgroundRemover');

window.Native = { Capacitor, App, Filesystem, Directory, Encoding, Dialog, BackgroundRemover };
