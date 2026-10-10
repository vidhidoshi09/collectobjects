// Copies the static web app (index.html, assets/, vendor/) into www/, which Capacitor bundles into the Android app.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'vendor'), path.join(out, 'vendor'), { recursive: true });

console.log('Web app copied to www/');
