import { fmtShortDate } from './format.js';

/* ════════════════════════════════════════════════
   COPY — every user-facing word lives here (mirrors design/content.md)
   To rename the app, change BRAND (and TAGLINE), the noun (ITEM / ITEMS / AN_ITEM) and COLLECTION below;
   every other string is built from them. Outside the web UI, also rename
   capacitor.config.json appName, android/app/src/main/res/values/strings.xml
   (app_name, title_activity_main), <title> in index.html, store/ and design docs.
   Voice: lowercase, warm, playful, brief. No exclamation marks, no emoji.
   Button labels (buttons, menu items, dialog actions) are Sentence case: "Add to collection".
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
    title: COLLECTION,
    count: n => (n === 1 ? `1 ${ITEM}` : `${n} ${ITEMS}`),
    gridLabel: `your ${ITEMS}`,
    add: `add ${AN_ITEM}`, // FAB accessibility label
  },
  empty: {
    title: 'start collecting',
    body: 'every little thing has a story. add your first.',
    cta: `Add ${AN_ITEM}`,
  },
  camera: {
    label: 'camera',
    blocked: "camera's off. turn it on in settings, or pick a photo instead.",
    gallery: 'choose from gallery',
    shutter: 'take photo',
  },
  processing: {
    cutting: 'framing it…',
    setup: 'getting ready…',
    setupSub: 'one-time setup',
  },
  review: {
    label: `name your ${ITEM}`,
    name: 'name',
    namePlaceholder: 'what is it?',
    photo: `your ${ITEM}`,
    storyPlaceholder: "what's the story? (optional)",
    retake: 'retake',
    save: `Add to ${COLLECTION}`,
    city: {
      add: 'Add city',
      finding: 'finding city…',
      remove: city => `remove ${city.toLowerCase()}`, // accessibility label of a filled chip
    },
  },
  item: {
    untitled: `untitled ${ITEM}`,
    no: exhibitNo,      // kept in the data, not shown
    date: fmtShortDate, // grid: "oct 11" (year only when not this year)
    dateLine,           // detail: "oct 11", or "oct 11 · london"
  },
  detail: {
    label: ITEM,
    name: 'name',
    story: 'story',
    storyPlaceholder: "what's the story?",
    more: 'more',
    delete: 'Delete', // menu item
  },
  delete: {
    title: `delete this ${ITEM}?`,
    body: "this can't be undone.",
    confirm: 'Delete',
    cancel: 'Keep it',
  },
  common: { close: 'close' },
  // first open of the day, by the phone's local time (no location needed)
  greeting: hour =>
    hour >= 5 && hour < 12 ? 'good morning' :
    hour >= 12 && hour < 17 ? 'good afternoon' :
    hour >= 17 && hour < 22 ? 'good evening' : 'up late?',
  toast: {
    added: `added to your ${COLLECTION}`, // after saving, as it drops in
    deleted: `${ITEM} deleted`,
    cutoutFailed: "couldn't cut this one out, so we kept the whole photo.",
    saveFailed: "couldn't save. try again?",
    photoUnreadable: "that photo didn't open. try another one?",
    cityDenied: "location's off for collectobjects. you can turn it on in settings.",
    cityFailed: "couldn't find your city right now.",
    loadFailed: `couldn't load your ${ITEMS}. restart the app?`,
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
