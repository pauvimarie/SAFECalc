import { useEffect, useState } from 'react'

const KEY = 'safecalc.onboarded'

export function useOnboarded() {
  const [onboarded, setOnboarded] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (onboarded) {
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* private browsing — onboarding will just show again next launch */
      }
    }
  }, [onboarded])

  return [onboarded, () => setOnboarded(true)]
}
