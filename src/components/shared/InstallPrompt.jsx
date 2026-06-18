import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferred || dismissed) return null

  return (
    <div className="absolute left-3 right-3 bottom-[calc(100px+var(--safe-bottom))] z-20 animate-slideUp">
      <div className="bg-neutral-900/95 backdrop-blur border border-neutral-700 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <img src="/icons/icon-192.png" alt="" className="w-9 h-9 rounded-lg" />
        <div className="flex-1">
          <p className="text-white text-[13px] font-medium">Add SAFECalc to Home Screen</p>
          <p className="text-neutral-500 text-[11px]">Quick access, works offline</p>
        </div>
        <button
          onClick={async () => {
            deferred.prompt()
            await deferred.userChoice
            setDeferred(null)
          }}
          className="key text-emerald-400 text-[13px] font-semibold px-2"
        >
          Add
        </button>
        <button onClick={() => setDismissed(true)} className="key text-neutral-500 text-[13px] px-1">
          ✕
        </button>
      </div>
    </div>
  )
}
