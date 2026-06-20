// Firebase project configuration.
// SAFECalc requires Firebase Authentication (Anonymous + Email/Password)
// and Firestore Database (production mode).
// Storage is NOT required (Spark Plan compatible).

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app, auth, db

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  // Pin the anonymous identity to this storage origin so it survives
  // reloads. NOTE: a PWA "installed" on iOS (standalone display mode)
  // runs in a storage origin SEPARATE from Safari — this cannot make
  // the two share an identity, only prevent drift within each.
  setPersistence(auth, indexedDBLocalPersistence).catch(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {})
  })
} catch (err) {
  console.error('Firebase init failed:', err)
  // Fail soft: Firebase features disabled but app continues
}

export { app, auth, db }
