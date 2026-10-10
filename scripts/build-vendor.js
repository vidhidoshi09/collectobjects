// Bundles src/native.js (Capacitor core + plugins) into vendor/native.js for index.html.
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

esbuild.buildSync({
  entryPoints: [path.join(root, 'src/native.js')],
  outfile: path.join(root, 'vendor/native.js'),
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
});

console.log('Bundled vendor/native.js');
