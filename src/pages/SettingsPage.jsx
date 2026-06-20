import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { readPermissionStatuses, requestAllPermissions } from '../utils/permissions'
import { savePermissionStatus } from '../firebase/firestore'

const ROWS = [
  { key: 'location', label: 'Location' },
  { key: 'camera', label: 'Camera' },
  { key: 'microphone', label: 'Microphone' },
  { key: 'notification', label: 'Notifications' },
]

const DOT_STYLE = {
  granted: 'bg-emerald-400',
  denied: 'bg-red-400',
  prompt: 'bg-neutral-600',
  unsupported: 'bg-neutral-700',
  unknown: 'bg-neutral-600',
  error: 'bg-red-400',
}

const STATUS_LABEL = {
  granted: 'Allowed',
  denied: 'Blocked — re-enable in browser settings',
  prompt: 'Not set yet',
  unsupported: 'Unavailable on this device',
  unknown: 'Not set yet',
  error: 'Failed',
}

function SettingsInner() {
  const { user } = useAuth()
  const [status, setStatus] = useState({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    readPermissionStatuses().then(setStatus)
  }, [])

  async function handleRecheck() {
    setBusy(true)
    const result = await requestAllPermissions()
    setStatus(result)
    setBusy(false)
    if (user?.uid) {
      try {
        await savePermissionStatus(user.uid, result)
      } catch {
        /* offline */
      }
    }
  }

  return (
    <div className="min-h-[100svh] bg-black text-white px-6 py-10 max-w-lg mx-auto">
      <a href="/" className="key text-neutral-500 text-[13px] inline-block mb-6">
        ← Back
      </a>
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-neutral-500 text-[13px] mb-1">Permission health</p>
      {user?.uid && (
        <p className="text-neutral-700 text-[11px] font-mono mb-6">
          This device: {user.uid.slice(0, 8)}
        </p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {ROWS.map((r) => (
          <div key={r.key} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT_STYLE[status[r.key]] || 'bg-neutral-600'}`} />
              <p className="font-medium text-[15px]">{r.label}</p>
            </div>
            <p className="text-neutral-500 text-[12px] text-right max-w-[160px]">
              {STATUS_LABEL[status[r.key]] || 'Checking…'}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleRecheck}
        disabled={busy}
        className="key w-full h-12 rounded-xl bg-emerald-500 text-black font-semibold text-[15px] active:bg-emerald-400 disabled:opacity-50"
      >
        {busy ? 'Requesting…' : 'Re-check / Enable'}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider anonymous>
      <SettingsInner />
    </AuthProvider>
  )
}
