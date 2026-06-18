# SAFECalc

**Looks normal. Protects quietly.**

A fully working calculator that is also a discreet personal-safety platform. Typed secret codes silently trigger location capture and guardian alerts — the screen never stops looking like a calculator.

## Stack

React 19, Vite, Tailwind CSS v4, React Router, Firebase (Auth, Firestore only), vite-plugin-pwa. **No Firebase Storage required — compatible with Spark Plan.**

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

`firestore.rules` is already written: the protected person's anonymous account owns their incidents; a guardian can only read an incident after redeeming that person's invite code (which creates a `links/{guardianUid}_{userId}` document the rules check against).

## 4. Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # production build in dist/
npm run preview     # serve the production build locally
```

Install it like a real app: open the dev/preview URL on a phone (or Chrome desktop -> install icon in the address bar) and add it to the home screen. It launches standalone, with the SAFECalc shield-and-calculator icon, no browser chrome.

## Secret codes

Typed on the calculator and confirmed with `=`. Nothing on screen ever changes — the display always shows exactly what a normal calculator would show for that input.

| Code | Mode | Captures |
|---|---|---|
| `111=` | Concern | Location |
| `222=` | Assistance | Location |
| `333=` | Danger | Location |
| `911=` | Critical | Starts a silent 15-second countdown, then location + live tracking flag |
| `000=` | Cancel | Only does something if a `911` countdown is currently running — cancels it with no trace |

Everything funnels through `triggerEmergencyMode()` in `src/utils/emergencyActions.js`, which fails soft: a denied location permission just skips that piece instead of throwing.

## Guardian Dashboard

`/dashboard` is a separate route with its own real (non-anonymous) sign-in. After creating an account, a guardian redeems the 6-character invite code generated during the protected person's onboarding to link to them, then sees a live incident feed: alert-level badge, last known location with an OpenStreetMap link, and a timestamped timeline of events. They can mark an incident resolved.

## Demo flow

1. Open SAFECalc, do a couple of normal calculations (`25+25=`, `100÷4=`).
2. Type `911=`. Display behaves exactly as a normal calculator would — nothing visibly happens.
3. Wait 15 seconds (or open `/dashboard` on a second device/browser, signed in as a linked guardian, and watch the alert arrive automatically once the countdown completes).
4. Show the live map and the timeline populating in real time.

## Known limitations (by design, for a hackathon scope)

- Guardian notification is in-app realtime (Firestore `onSnapshot`), not SMS/push. Wiring real push would mean adding a Cloud Function on incident-create that sends FCM messages to guardian device tokens — the data model already has everything that function would need.
- The map is a keyless OpenStreetMap embed rather than Google Maps, so it works without a billing account.
- No file uploads — all data stored in Firestore (Spark Plan compatible).

## Project structure

```
src/
  components/Calculator/   the disguise: real calculator UI + engine wiring
  components/Onboarding/   3-screen first-run flow, writes guardian invites
  components/Dashboard/    guardian-facing UI
  components/shared/       install prompt
  firebase/                config, auth, firestore helpers
  utils/                   calculatorEngine.js (pure arithmetic), emergencyActions.js (location capture)
  pages/                   CalculatorPage ("/"), DashboardPage ("/dashboard")
```
