import { fmtShortDate } from './format.js';

/* ════════════════════════════════════════════════
   COPY — every user-facing word lives here (mirrors design/content.md)
   To rename the app, change BRAND (and TAGLINE), the noun (ITEM / ITEMS / AN_ITEM) and COLLECTION below;
   every other string is built from them. Outside the web UI, also rename
   capacitor.config.json appName, android/app/src/main/res/values/strings.xml
   (app_name, title_activity_main), ios/App/App/Info.plist (CFBundleDisplayName and the
   permission texts), <title> in index.html, store/ and design docs.
   Voice: warm, playful, brief. No exclamation marks, no emoji.
   Case: everything the app says is Sentence case ("Add to collection", "What is it?").
   What the person writes stays as typed; dates are small caps; the wordmark is always collectobjects.
   Accessibility labels stay lowercase (screen readers don't voice case).
════════════════════════════════════════════════ */
export const BRAND   = 'collectobjects';  // the wordmark: one word, lowercase, everywhere
export const TAGLINE = 'for your trinkets'; // brand lockup: "collectobjects — for your trinkets"
export const ITEM    = 'object';          // one thing in the collection
export const ITEMS   = 'objects';         // more than one
export const AN_ITEM = 'an object';       // with its article
export const COLLECTION = 'collection';   // what the home screen holds (its title)

const exhibitNo = no => `no. ${String(no).padStart(3, '0')}`;
const dateLine  = (date, city) => `${fmtShortDate(date)}${city ? ` · ${city.toLowerCase()}` : ''}`;

export const copy = {
  appName: BRAND,
  home: {
    title: `${COLLECTION[0].toUpperCase()}${COLLECTION.slice(1)}`, // "Collection"
    count: n => (n === 1 ? `1 ${ITEM}` : `${n} ${ITEMS}`),
    gridLabel: `your ${ITEMS}`,
    add: `add ${AN_ITEM}`, // add tile accessibility label (empty screen)
  },
  nav: {
    label: 'tabs', // tab bar accessibility label
    collection: `${COLLECTION[0].toUpperCase()}${COLLECTION.slice(1)}`, // "Collection"
    capture: 'Capture', // opens the camera
  },
  empty: {
    title: 'Start collecting',
    body: 'A little home for your trinkets and keepsakes.', // not "museum": too close to a competitor (Museeum)
  },
  camera: {
    label: 'camera',
    blocked: "Camera's off. Turn it on in Settings, or pick a photo instead.",
    gallery: 'choose from gallery',
    shutter: 'take photo',
  },
  processing: {
    cutting: 'Framing it…',
    setup: 'Getting ready…',
    setupSub: 'One-time setup',
  },
  review: {
    label: `name your ${ITEM}`,
    name: 'name',
    namePlaceholder: 'Give it a name', // naming is never required: the keyboard waits for a tap
    suggestTitle: 'Suggestions', // over the name chips (shown in small caps)
    suggestLabel: 'suggested names',
    photo: `your ${ITEM}`,
    retake: 'retake',
    save: `Add to ${COLLECTION}`,
    city: {
      add: 'Add city',
      finding: 'Finding city…',
      remove: city => `remove ${city.toLowerCase()}`, // accessibility label of a filled chip
    },
  },
  item: {
    untitled: `untitled ${ITEM}`, // accessibility label of an unnamed object; never shown
    no: exhibitNo,      // kept in the data, not shown
    date: fmtShortDate, // grid: "oct 11" (year only when not this year)
    dateLine,           // detail: "oct 11", or "oct 11 · london"
  },
  detail: {
    label: ITEM,
    carousel: `your ${ITEMS}, swipe for more`, // carousel accessibility label
    name: 'name',
    namePlaceholder: 'Name it',
    shareLabel: 'share', // share button accessibility label
    deleteLabel: 'delete', // delete button accessibility label (it asks first)
  },
  delete: {
    title: `Delete this ${ITEM}?`,
    body: "This can't be undone.",
    confirm: 'Delete',
    cancel: 'Keep it',
  },
  tumble: {
    tidy: 'Tidy up', // shake to tumble: puts the objects back in the grid
  },
  share: {
    collectionTitle: `My ${COLLECTION}`, // the collection card's title
    dialogTitle: 'Share',
  },
  common: { close: 'close' },
  // first open of the day, by the phone's local time (no location needed)
  // toasts are Sentence case, each with an icon
  greeting: hour =>
    hour >= 5 && hour < 12 ? { text: 'Good morning', icon: 'sunrise' } :
    hour >= 12 && hour < 17 ? { text: 'Good afternoon', icon: 'sun' } :
    hour >= 17 && hour < 22 ? { text: 'Good evening', icon: 'moon' } : { text: 'Up late?', icon: 'moon' },
  toast: {
    added: { text: `Added to your ${COLLECTION}`, icon: 'check' }, // after saving, as it drops in
    deleted: { text: `${ITEM[0].toUpperCase()}${ITEM.slice(1)} deleted`, icon: 'delete' },
    cutoutFailed: { text: "Couldn't cut this one out, so we kept the whole photo", icon: 'error' },
    saveFailed: { text: "Couldn't save. Try again?", icon: 'error' },
    photoUnreadable: { text: "That photo didn't open. Try another one?", icon: 'error' },
    cityDenied: { text: `Location's off for ${BRAND}. You can turn it on in Settings`, icon: 'error' },
    cityFailed: { text: "Couldn't find your city right now", icon: 'error' },
    shareFailed: { text: "Couldn't share. Try again?", icon: 'error' },
    loadFailed: { text: `Couldn't load your ${ITEMS}. Restart the app?`, icon: 'error' },
  },
};

const lookup = key => key.split('.').reduce((o, k) => o?.[k], copy);

/* Fills the static markup: data-copy → text, data-copy-aria → aria-label,
   data-copy-placeholder → placeholder, data-copy-alt → alt. */
export function applyCopy(root = document) {
  document.title = copy.appName;
  const attrs = { copyAria: 'aria-label', copyPlaceholder: 'placeholder', copyAlt: 'alt' };
  root.querySelectorAll('[data-copy], [data-copy-aria], [data-copy-placeholder], [data-copy-alt]').forEach(el => {
    if (el.dataset.copy) el.textContent = lookup(el.dataset.copy);
    for (const [key, attr] of Object.entries(attrs)) {
      if (el.dataset[key]) el.setAttribute(attr, lookup(el.dataset[key]));
    }
  });
}
