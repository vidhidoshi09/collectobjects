# Play Console answers (draft)

## Data safety

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **See note on ML Kit below.** The app itself: **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable if nothing is collected |
| Do you provide a way for users to request that their data is deleted? | Not applicable (no data leaves the device; uninstalling deletes it) |

**Note on ML Kit (verify before submitting):** Google's ML Kit can send Google
performance/diagnostic information (not photos). Open Google's **"ML Kit data
disclosure"** page and follow its guidance for the Data safety form. If it says to
declare it, declare **App info and performance → Diagnostics**, collected, not
shared, purpose **Analytics / App functionality**, not optional, processed
ephemerally where it says so.

Photos, names and stories are **not collected**: they never leave the device.

## Content rating questionnaire

- Category: **Utility, productivity, communication or other**
- Violence, sexual content, language, controlled substances, gambling: **No**
- Users can interact or exchange content with other users: **No**
- Shares user's location: **No**
- Allows purchases of digital goods: **No**

## App access

All functionality is available without special access or login.

## Ads

The app does **not** contain ads.

## Target audience

13 and over. Not designed for children.

## Permissions declared

| Permission | Why |
|---|---|
| `CAMERA` | Photograph objects |
| `INTERNET` | Included by the app framework (Capacitor) and used for development live reload; the app itself makes no network requests |
