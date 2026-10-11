// Bundled into vendor/native.js (see scripts/build-vendor.js) so the plain-script
// index.html can reach Capacitor's native features via window.Native.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Haptics } from '@capacitor/haptics';

// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/BackgroundRemoverPlugin.java
const BackgroundRemover = registerPlugin('BackgroundRemover');
// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/NativeUiPlugin.java
const NativeUi = registerPlugin('NativeUi');
// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/PlacePlugin.java
const Place = registerPlugin('Place');

window.Native = { Capacitor, App, Filesystem, Directory, Encoding, Haptics, BackgroundRemover, NativeUi, Place };
