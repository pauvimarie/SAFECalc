# SAFECalc

**Looks normal. Protects quietly.**

A fully working calculator that is also a discreet personal-safety platform. Typed secret codes silently trigger location capture, evidence checks, and guardian alerts — the screen never stops looking like a calculator.

## Stack

React 19, Vite, Tailwind CSS v4, React Router, Firebase (Auth, Firestore only), vite-plugin-pwa. **No Firebase Storage required — compatible with Spark Plan.** Photo/audio evidence is captured client-side and written as small fields on the Firestore document, never uploaded to Storage.

## 1. Create a Firebase project

1. Go to console.firebase.google.com -> Add project.
2. Build -> Authentication -> Sign-in method -> enable **Anonymous** and **Email/Password**.
3. Build -> Firestore Database -> Create database (production mode, any region).
4. Project settings -> General -> Your apps -> Add app -> Web. Copy the config values.

**Note:** Storage setup is not required.

## 2. Configure the app

```bash
cp .env.example .env
# paste your Firebase config values into .env
```

## 3. Deploy security rules

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add               # pick your project
firebase deploy --only firestore:rules
```

`firestore.rules` is already written: the protected person's anonymous account owns their incidents and their own `users/{uid}` permission-status doc; a guardian can only read an incident after redeeming that person's invite code (which creates a `links/{guardianUid}_{userId}` document the rules check against). Guardians may only ever update an incident's `status`, `acknowledged`, and `acknowledgedAt` fields — never its content.

## 4. Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # production build in dist/
npm run preview     # serve the production build locally
```

Install it like a real app: open the dev/preview URL on a phone (or Chrome desktop -> install icon in the address bar) and add it to the home screen. It launches standalone, with the SAFECalc shield-and-calculator icon, no browser chrome.

**iOS note:** a PWA added via "Add to Home Screen" runs in a storage origin separate from Safari. Set up guardians and grant permissions from the *same installed app instance* you'll trigger alerts from — otherwise the anonymous identity won't match.

## Discreet navigation

The calculator face shows nothing but digits — no visible Setup/Dashboard buttons. A small ☰ in the top-left corner opens the real menu:

```
☰
├ Guardian Setup
├ Dashboard
├ Settings
└ Install App
```

## Onboarding flow

1. **Welcome** — name, tagline.
2. **Features** — what SAFECalc does, in plain language.
3. **Permissions** — requests location, camera, microphone, and notification access up front, so they're already granted by the time a code is typed. Status is saved to `users/{uid}` in Firestore. Skippable.
4. **Guardian Setup** — add guardians, generate invite codes.

## Secret codes

Typed on the calculator and confirmed with `=`. Nothing on screen ever changes — the display always shows exactly what a normal calculator would show for that input. On success the display silently clears, as if `AC` had been pressed.

| Code | Mode | Location | Microphone | Camera | Tracking |
|---|---|---|---|---|---|
| `111=` | Concern | One-time ping | — | — | — |
| `222=` | Assistance | One-time ping | Ambient loudness check | — | Repeat pings, 2 min |
| `333=` | Danger | One-time ping | Ambient loudness check | Photo snapshot | Repeat pings, 5 min |
| `911=` | Critical | One-time ping | Ambient loudness check | Photo snapshot | Repeat pings, 10 min |
| `000=` | Cancel | — | — | — | Only does something if a `911` countdown is currently running — cancels it with no trace |

- **Microphone** is used for a single ~4-second ambient loudness check, never a recording — only the peak level (and whether it crossed a threshold) is saved.
- **Camera** captures one downsized, compressed still frame (a small base64 JPEG written directly onto the incident document, no Storage upload).
- **911** starts a silent 15-second countdown before any of the above runs, so it can be cancelled with `000=` if triggered by mistake.

Everything funnels through `triggerEmergencyMode()` in `src/utils/emergencyActions.js`, which fails soft: a denied location/camera/microphone permission just skips that piece instead of throwing.

## Guardian Dashboard

`/dashboard` is a separate route with its own real (non-anonymous) sign-in. After creating an account, a guardian redeems the 6-character invite code generated during the protected person's onboarding (or from `/setup`) to link to them, then sees a live incident feed:

- Alert-level badge (🟢🟡🟠🔴) and an unread count badge.
- The newest active incident is highlighted and pulses briefly.
- A toast — and a real OS notification, if the guardian granted notification permission — fires the moment a new alert arrives.
- Opening an incident marks it **✓ Delivered** (a read-receipt written back to Firestore, visible to the protected person's timeline too).
- Last known location with an OpenStreetMap link, photo snapshot and ambient-check result when present, and a full timestamped timeline.
- Guardians can mark an incident resolved.

## Settings

`/settings` shows permission health for location, camera, microphone, and notifications (granted / blocked / not set), with a one-tap re-request button — useful after the onboarding step was skipped or a permission was later revoked in the browser.

## Demo flow

1. Open SAFECalc, do a couple of normal calculations (`25+25=`, `100÷4=`).
2. Type `911=`. Display behaves exactly as a normal calculator would, then clears — nothing visibly alarming happens.
3. Wait 15 seconds (or open `/dashboard` on a second device/browser, signed in as a linked guardian) and watch the alert arrive automatically, with a notification and a pulsing highlight, once the countdown completes.
4. Open the incident: show the live map, the captured photo, the ambient-check result, and the timeline populating in real time.
5. Show the **✓ Delivered** acknowledgment appear once the guardian opens it.

## Known limitations (by design, for a hackathon scope)

- Guardian notification is in-app realtime (Firestore `onSnapshot`) plus a local browser Notification when the dashboard tab/app is open — not a true server-pushed SMS/notification when the guardian's app is closed. Real push would mean a Cloud Function on incident-create sending FCM messages, which needs the Blaze plan — the data model already has everything that function would need.
- The map is a keyless OpenStreetMap embed rather than Google Maps, so it works without a billing account.
- Photo snapshots are small and compressed (downsized to fit comfortably under Firestore's 1MiB document limit) — not full-resolution evidence.
- No file uploads — all data stored in Firestore (Spark Plan compatible).
- Anonymous identity is tied to the browser/app storage origin it was created in; clearing site data or switching storage contexts (e.g. browser tab vs. installed iOS PWA) starts a new identity and breaks existing guardian links until re-linked.

## Project structure

```
src/
  components/Calculator/   the disguise: real calculator UI + engine wiring
  components/Onboarding/   4-screen first-run flow: welcome, features, permissions, guardian setup
  components/Dashboard/    guardian-facing UI (feed, incident cards, location vault, alert badges)
  components/shared/       hamburger menu, install prompt, toast
  firebase/                config, auth, firestore helpers
  utils/                   calculatorEngine.js (pure arithmetic), emergencyActions.js (location/photo/sound pipeline), permissions.js (browser permission helpers)
  pages/                   CalculatorPage ("/"), DashboardPage ("/dashboard"), SetupPage ("/setup"), SettingsPage ("/settings")
```
