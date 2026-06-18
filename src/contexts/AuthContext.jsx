import { createContext, useContext, useEffect, useState } from 'react'
import { ensureAnonymousUser, watchAuth } from '../firebase/auth'
import { firebaseReady } from '../firebase/config'

const AuthCtx = createContext({ user: null, loading: true, ready: firebaseReady })

export function AuthProvider({ children, anonymous = false }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseReady)

  useEffect(() => {
    if (!firebaseReady) return

    if (anonymous) {
      ensureAnonymousUser()
        .then(setUser)
        .finally(() => setLoading(false))
      return watchAuth(setUser)
    }

    return watchAuth((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [anonymous])

  return <AuthCtx.Provider value={{ user, loading, ready: firebaseReady }}>{children}</AuthCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- shared hook lives alongside its provider intentionally
export function useAuth() {
  return useContext(AuthCtx)
}
