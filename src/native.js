// Bundled into vendor/native.js (see scripts/build-vendor.js) so the plain-script
// index.html can reach Capacitor's native features via window.Native.
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Haptics } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import Matter from 'matter-js'; // physics for shake to tumble (js/tumble.js)

// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/BackgroundRemoverPlugin.java
// and ios/App/App/BackgroundRemoverPlugin.swift
const BackgroundRemover = registerPlugin('BackgroundRemover');
// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/NativeUiPlugin.java
// and ios/App/App/NativeUiPlugin.swift
const NativeUi = registerPlugin('NativeUi');
// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/PlacePlugin.java
// and ios/App/App/PlacePlugin.swift
const Place = registerPlugin('Place');
// Implemented in android/app/src/main/java/com/vidhidoshi/collectobjects/FeelPlugin.java
// and ios/App/App/FeelPlugin.swift (Core Haptics)
const Feel = registerPlugin('Feel');

window.Native = { Capacitor, App, Filesystem, Directory, Encoding, Haptics, BackgroundRemover, NativeUi, Place, Share, Feel, Matter };
