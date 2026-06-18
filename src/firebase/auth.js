import {
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './config'

// SAFECalc itself never asks the protected person to "log in" — that would
// break the disguise. It signs them in anonymously on first launch so their
// data has a stable owner in Firestore/Storage.
export function ensureAnonymousUser() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        unsub()
        if (user) {
          resolve(user)
        } else {
          signInAnonymously(auth).then((cred) => resolve(cred.user)).catch(reject)
        }
      },
      reject
    )
  })
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

// Guardians use real accounts so they can log into the dashboard from any device.
export async function guardianSignUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(cred.user, { displayName })
  return cred.user
}

export async function guardianSignIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export function guardianSignOut() {
  return signOut(auth)
}
