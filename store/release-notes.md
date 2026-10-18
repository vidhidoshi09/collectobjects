# collectobjects: release notes

Words for the app stores, TestFlight and GitHub Releases. Sentence case, warm and brief,
no exclamation marks or emoji (see `design/content.md`).

## Build 1.1 (in testing)

**Short version (stores, up to 500 characters)**

A calmer, more playful collectobjects. Your collection now shows just the objects, under a floating glass tab bar. Tap one and it flies open; swipe left and right to visit the rest, with a little tick for each. Names are suggested for you, and naming stays optional. Shake your phone hard and everything tumbles into a pile you can play with. And it's on iPhone now.

**What's new**

- **Just the objects.** The collection shows your objects alone, no labels, on a soft warm background. Names and dates live in the close-up.
- **A glass tab bar.** Collection and Capture float at the bottom and tuck away as you scroll.
- **The close-up is a carousel.** Tap an object and it flies open while the rest step aside. Swipe to visit the others, with a gentle haptic tick for each one. Share and Delete sit just below; Delete always asks first.
- **Name suggestions.** After the cut-out, a few names appear for you to tap. They're worked out on your phone, so your photo still never leaves it.
- **Naming is optional.** The keyboard waits until you want it, and an unnamed object simply shows no label.
- **Shake to tumble.** Shake hard on the home screen and your whole collection falls into a heap, in slow motion. Drag them, toss them, tilt your phone to roll them around, then tidy up. Each object feels a little different when it lands.
- **Little touches.** Objects rise in when you open the app, a deleted object fades away, and you'll feel small taps in the right places.
- **iPhone.** collectobjects now runs on iPhone, with the cut-out done by Apple's own on-device tools (iOS 17 or newer).

**Changed**

- The story field is gone, to keep saving quick and the close-up calm. Stories you already wrote are kept safely, just not shown.
- Cut-outs no longer have a white outline, so the objects themselves shine.

**Fixed**

- The close-up now tilts with your phone on iPhone.

**Still private.** No account, no ads, no tracking. Everything stays on your phone.

---

**What to test (TestFlight / testers)**

1. Snap a few objects. Do the name suggestions make sense? Does the cut-out look clean?
2. Tap an object, swipe through the carousel, close it. Does it fly back to the right place?
3. Delete one: does it ask first, and fade away?
4. Shake hard on the home screen. Does it feel slow and bouncy? Can you drag and toss them? Tidy up.
5. Scroll a long collection: does the tab bar shrink and come back?
6. Tell us anything that feels off, slow, or confusing.

**Known limits**

- iPhone cut-outs need iOS 17 or newer; older iPhones keep the whole photo.
- Name suggestions are in English for now.
- Shake to tumble uses your 40 newest objects.
