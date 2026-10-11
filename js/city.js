import { Place, isNative } from './platform.js';
import { copy } from './copy.js';
import { showSnackbar } from './snackbar.js';

/* ════════════════════════════════════════════════
   CITY — where an object was found, city name only (Android)
   A chip on the review screen. Camera captures fill it in by themselves once
   location is allowed; otherwise "add city" asks the first time it's tapped.
   Tap a filled chip to take the city off. Coordinates never reach the app.
════════════════════════════════════════════════ */
const chip = document.getElementById('city-chip');
const label = document.getElementById('city-chip-text');
let city = '';
let finding = false;
let lookup = 0; // ignores an answer that arrives after the screen moved on

function render() {
  chip.classList.toggle('chip--filled', Boolean(city));
  chip.classList.toggle('chip--finding', finding);
  label.textContent = finding ? copy.review.city.finding : city ? city.toLowerCase() : copy.review.city.add;
  if (city && !finding) chip.setAttribute('aria-label', copy.review.city.remove(city));
  else chip.removeAttribute('aria-label');
}

async function find({ quiet }) {
  const id = ++lookup;
  finding = true;
  render();
  try {
    const result = await Place.getCity();
    if (id === lookup) city = result.city || '';
  } catch (err) {
    if (id === lookup && !quiet) showSnackbar(err.code === 'DENIED' ? copy.toast.cityDenied : copy.toast.cityFailed);
  }
  if (id !== lookup) return;
  finding = false;
  render();
}

// A new object on the review screen. `auto`: a camera capture, so it was found here
export async function resetCity({ auto = false } = {}) {
  lookup++;
  city = '';
  finding = false;
  chip.hidden = !isNative;
  render();
  if (!isNative || !auto) return;
  try {
    const { location } = await Place.checkPermissions();
    if (location === 'granted') find({ quiet: true });
  } catch { /* stays "add city" */ }
}

export const currentCity = () => (finding ? '' : city);

chip.addEventListener('click', () => {
  if (finding) return;
  if (city) { city = ''; render(); }
  else find({ quiet: false });
});
