// Copies the static web app (index.html, css/, js/, assets/, vendor/) into www/, which Capacitor bundles into the Android app.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(out, 'index.html'));
for (const dir of ['css', 'js', 'assets', 'vendor']) {
  fs.cpSync(path.join(root, dir), path.join(out, dir), {
    recursive: true,
    filter: src => !src.startsWith(path.join(root, 'assets', 'logo')), // brand files for the store, not the app
  });
}

// The privacy policy, from store/privacy-policy.md, at /privacy.html (the public URL Play and the App Store ask for)
const inline = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1<em>$2</em>');
const body = fs.readFileSync(path.join(root, 'store', 'privacy-policy.md'), 'utf8').split(/\n{2,}/).map(block => {
  const b = block.trim();
  if (b === '---') return '<hr>';
  if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`;
  if (b.startsWith('# ')) return `<h1>${inline(b.slice(2))}</h1>`;
  if (b.startsWith('- ')) return `<ul>${b.split(/\n(?=- )/).map(li => `<li>${inline(li.slice(2))}</li>`).join('')}</ul>`;
  return b && `<p>${inline(b)}</p>`;
}).join('\n');
fs.writeFileSync(path.join(out, 'privacy.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy policy · collectobjects</title>
<style>
@font-face{font-family:'Bricolage Grotesque';src:url(assets/fonts/bricolage-grotesque-latin-wght-normal.woff2) format('woff2');font-weight:200 800}
@font-face{font-family:'Instrument Sans';src:url(assets/fonts/instrument-sans-latin-wght-normal.woff2) format('woff2');font-weight:400 700}
body{margin:0;background:#EEECE9;color:#141414;font:17px/1.55 'Instrument Sans',system-ui,sans-serif}
main{max-width:640px;margin:0 auto;padding:48px 16px 80px}
h1,h2{font-family:'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.02em;line-height:1.15}
h1{font-size:34px;margin:0 0 8px}h2{font-size:22px;margin:36px 0 8px}
hr{border:0;border-top:1px solid rgba(0,0,0,.1);margin:32px 0}ul{padding-left:20px}em{color:#6b6763}
</style></head><body><main>
${body}
</main></body></html>
`);

console.log('Web app copied to www/');
