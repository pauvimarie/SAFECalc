import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getGuardianLinks, listenIncidentsForUsers } from '../../firebase/firestore'
import { guardianSignOut } from '../../firebase/auth'
import { requestNotificationPermission, readNotificationStatus } from '../../utils/permissions'
import IncidentFeed from './IncidentFeed'
import LinkPersonForm from './LinkPersonForm'
import { LEVELS } from './AlertBadge'
import Toast from '../shared/Toast'

function notifyBrowser(title, body) {
  if (readNotificationStatus() !== 'granted') return
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  } catch {
    /* notification is a nice-to-have, never block on it */
  }
}

export default function GuardianDashboard() {
  const { user } = useAuth()
  const [links, setLinks] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loadingLinks, setLoadingLinks] = useState(true)
  const [toast, setToast] = useState(null)
  const [notifStatus, setNotifStatus] = useState('unknown')
  const seenIds = useRef(new Set())
  const firstSnapshot = useRef(true)

  useEffect(() => {
    setNotifStatus(readNotificationStatus())
  }, [])

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission()
    setNotifStatus(result)
  }

  const refreshLinks = useCallback(async () => {
    if (!user) return
    setLoadingLinks(true)
    try {
      const l = await getGuardianLinks(user.uid)
      setLinks(l)
    } catch (err) {
      console.error('Failed to load links:', err)
    }
    setLoadingLinks(false)
  }, [user])

  useEffect(() => {
    refreshLinks()
  }, [refreshLinks])

  useEffect(() => {
    if (!links.length) {
      setIncidents([])
      return
    }
    seenIds.current = new Set()
    firstSnapshot.current = true
    const userIds = [...new Set(links.map((l) => l.userId))]
    return listenIncidentsForUsers(userIds, (newIncidents) => {
      // Detect genuinely new arrivals (skip the initial load so the
      // dashboard doesn't toast/notify for incidents that already existed).
      if (!firstSnapshot.current) {
        const fresh = newIncidents.find((i) => !seenIds.current.has(i.id))
        if (fresh) {
          const label = LEVELS[fresh.level]?.label || fresh.level
          setToast(`New Alert Received — ${label}`)
          setTimeout(() => setToast(null), 3500)
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('SAFECalc Alert', {
                body: `${label} alert received — open the dashboard for details.`,
                icon: '/icons/icon-192.png',
              })
            } catch {
              /* blocked or unsupported in this context */
            }
          }
          notifyBrowser('SAFECalc Alert', `${label} alert received.`)
        }
      }
      firstSnapshot.current = false
      seenIds.current = new Set(newIncidents.map((i) => i.id))
      setIncidents(newIncidents)
    })
  }, [links])

  const activeCount = incidents.filter((i) => i.status === 'active').length
  const highestActive = incidents.find((i) => i.status === 'active')
  const newestId = incidents[0]?.id

  return (
    <div className="min-h-[100svh] bg-black text-white px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Guardian Dashboard</h1>
          <p className="text-neutral-500 text-[13px]">{user?.email}</p>
        </div>
        <button onClick={guardianSignOut} className="key text-neutral-400 text-[13px]">
          Sign Out
        </button>
      </div>

      {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
        <button
          onClick={handleEnableNotifications}
          className="key w-full mb-5 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-left flex items-center justify-between"
        >
          <span className="text-[13px] text-neutral-300">Get notified the instant an alert comes in</span>
          <span className="text-emerald-400 text-[13px] font-medium">Enable</span>
        </button>
      )}

      {activeCount > 0 && highestActive && (
        <div className={`rounded-2xl p-4 mb-5 border ${LEVELS[highestActive.level]?.ring} ${LEVELS[highestActive.level]?.bg} animate-fadeIn`}>
          <p className="text-[13px] font-medium">
            {activeCount} active alert{activeCount > 1 ? 's' : ''} — highest level {LEVELS[highestActive.level]?.label}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Protecting</p>
        {loadingLinks ? (
          <p className="text-neutral-600 text-[13px]">Loading…</p>
        ) : links.length ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {links.map((l) => (
              <span key={l.id} className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[13px]">
                {l.name} <span className="text-neutral-500">· {l.relation}</span>
                <span className="text-neutral-700 font-mono"> · {l.userId?.slice(0, 8)}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600 text-[13px] mb-3">You're not linked to anyone yet. Enter an invite code below.</p>
        )}
        <LinkPersonForm guardianUid={user?.uid} guardianEmail={user?.email} onLinked={refreshLinks} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <p className="text-neutral-400 text-[12px] font-medium uppercase tracking-wide">Incidents</p>
        {incidents.length > 0 && (
          <span className="text-[11px] font-semibold bg-neutral-800 text-neutral-300 rounded-full px-2 py-0.5">
            {incidents.length}
          </span>
        )}
        {activeCount > 0 && (
          <span className="text-[11px] font-semibold bg-red-500/15 text-red-400 rounded-full px-2 py-0.5 animate-pop">
            {activeCount} active
          </span>
        )}
      </div>
      <IncidentFeed incidents={incidents} newestId={newestId} />
      {toast && <Toast message={toast} />}
    </div>
  )
}
