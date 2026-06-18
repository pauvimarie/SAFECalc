import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getGuardianLinks, listenIncidentsForUsers } from '../../firebase/firestore'
import { guardianSignOut } from '../../firebase/auth'
import IncidentFeed from './IncidentFeed'
import LinkPersonForm from './LinkPersonForm'
import { LEVELS } from './AlertBadge'

export default function GuardianDashboard() {
  const { user } = useAuth()
  const [links, setLinks] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loadingLinks, setLoadingLinks] = useState(true)

  const refreshLinks = useCallback(async () => {
    if (!user) return
    setLoadingLinks(true)
    const l = await getGuardianLinks(user.uid)
    setLinks(l)
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
    const userIds = [...new Set(links.map((l) => l.userId))]
    return listenIncidentsForUsers(userIds, setIncidents)
  }, [links])

  const activeCount = incidents.filter((i) => i.status === 'active').length
  const highestActive = incidents.find((i) => i.status === 'active')

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
              </span>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600 text-[13px] mb-3">You're not linked to anyone yet. Enter an invite code below.</p>
        )}
        <LinkPersonForm guardianUid={user?.uid} guardianEmail={user?.email} onLinked={refreshLinks} />
      </div>

      <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Incidents</p>
      <IncidentFeed incidents={incidents} />
    </div>
  )
}
