import { createContext, useContext, useEffect, useState } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseReady } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ anonymous = false, children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false)
      return
    }

    try {
      // Set up auth listener
      const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (!u && anonymous) {
          // Auto-sign in anonymously if not signed in
          try {
            await signInAnonymously(auth)
          } catch (err) {
            console.error('Anonymous sign in failed:', err)
          }
        }
        setUser(u)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error('Auth setup failed:', err)
      setLoading(false)
    }
  }, [anonymous])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
