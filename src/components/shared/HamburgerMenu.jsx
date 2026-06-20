import { useEffect, useRef, useState } from 'react'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const deferredInstall = useRef(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      deferredInstall.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    setOpen(false)
    if (!deferredInstall.current) return
    deferredInstall.current.prompt()
    await deferredInstall.current.userChoice
    deferredInstall.current = null
    setCanInstall(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="key absolute top-3 left-3 z-30 w-9 h-9 rounded-full flex items-center justify-center"
      >
        <div className="flex flex-col gap-[3px]">
          <span className="block w-4 h-[1.5px] bg-neutral-600 rounded-full" />
          <span className="block w-4 h-[1.5px] bg-neutral-600 rounded-full" />
          <span className="block w-4 h-[1.5px] bg-neutral-600 rounded-full" />
        </div>
      </button>

      {open && (
        <div className="absolute inset-0 z-40 animate-fadeIn">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-neutral-950 border-r border-neutral-800 px-5 py-8 animate-slideUp flex flex-col">
            <p className="text-neutral-500 text-[13px] font-mono mb-4">☰</p>
            <nav className="flex flex-col gap-1 font-mono text-[14px]">
              <a
                href="/setup"
                className="key flex items-center gap-2 text-neutral-300 py-2.5 active:text-emerald-400"
              >
                <span className="text-neutral-600">├</span> Guardian Setup
              </a>
              <a
                href="/dashboard"
                className="key flex items-center gap-2 text-neutral-300 py-2.5 active:text-emerald-400"
              >
                <span className="text-neutral-600">├</span> Dashboard
              </a>
              <a
                href="/settings"
                className="key flex items-center gap-2 text-neutral-300 py-2.5 active:text-emerald-400"
              >
                <span className="text-neutral-600">├</span> Settings
              </a>
              <button
                onClick={handleInstall}
                disabled={!canInstall}
                className="key flex items-center gap-2 text-neutral-300 py-2.5 text-left disabled:text-neutral-700 active:text-emerald-400"
              >
                <span className="text-neutral-600">└</span> Install App
              </button>
            </nav>
            <div className="flex-1" />
            <p className="text-neutral-700 text-[11px]">SAFECalc</p>
          </div>
        </div>
      )}
    </>
  )
}
