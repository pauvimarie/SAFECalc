import { useState } from 'react'
import { requestAllPermissions } from '../../utils/permissions'
import { savePermissionStatus } from '../../firebase/firestore'

const ROWS = [
  { key: 'location', label: 'Location', desc: 'Lets guardians see where you are.' },
  { key: 'camera', label: 'Camera', desc: 'Reserved for future evidence capture.' },
  { key: 'microphone', label: 'Microphone', desc: 'Reserved for future evidence capture.' },
  { key: 'notification', label: 'Notifications', desc: 'Lets the app alert guardians instantly.' },
]

const STATUS_STYLE = {
  granted: 'text-emerald-400',
  denied: 'text-red-400',
  prompt: 'text-neutral-500',
  unsupported: 'text-neutral-600',
  unknown: 'text-neutral-600',
  error: 'text-red-400',
}

const STATUS_LABEL = {
  granted: 'Allowed',
  denied: 'Blocked',
  prompt: 'Not set',
  unsupported: 'Unavailable',
  unknown: 'Not set',
  error: 'Failed',
}

export default function PermissionScreen({ userId, onContinue }) {
  const [status, setStatus] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleEnable() {
    setBusy(true)
    const result = await requestAllPermissions()
    setStatus(result)
    setDone(true)
    setBusy(false)
    if (userId) {
      try {
        await savePermissionStatus(userId, result)
      } catch {
        /* offline / no Firebase — onboarding still continues */
      }
    }
  }

  return (
    <div className="h-full flex flex-col px-7 py-12 bg-black text-white animate-fadeIn">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Enable Permissions</h1>
      <p className="text-neutral-400 text-[15px] mb-7 leading-snug">
        SAFECalc needs these to work the moment something happens — not after.
      </p>

      <div className="flex-1 flex flex-col gap-3">
        {ROWS.map((r) => (
          <div key={r.key} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-[15px]">{r.label}</p>
              <p className="text-neutral-500 text-[12px] mt-0.5">{r.desc}</p>
            </div>
            <span className={`text-[12px] font-medium ${STATUS_STYLE[status[r.key]] || 'text-neutral-600'}`}>
              {status[r.key] ? STATUS_LABEL[status[r.key]] : '—'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleEnable}
        disabled={busy}
        className="key w-full h-14 rounded-2xl bg-emerald-500 text-black font-semibold text-[17px] active:bg-emerald-400 disabled:opacity-50 mt-6"
      >
        {busy ? 'Requesting…' : done ? 'Re-check Permissions' : 'Enable All'}
      </button>
      <button
        onClick={onContinue}
        className="key w-full h-12 rounded-2xl text-neutral-400 text-[15px] font-medium mt-2"
      >
        {done ? 'Continue' : 'Skip for now'}
      </button>
    </div>
  )
}
