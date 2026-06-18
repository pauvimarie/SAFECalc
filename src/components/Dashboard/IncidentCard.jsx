import { useState } from 'react'
import AlertBadge from './AlertBadge'
import LiveMap from './LiveMap'
import LocationVault from './LocationVault'
import Timeline from './Timeline'
import { listenTimeline, tsToDate, resolveIncident } from '../../firebase/firestore'
import { useEffect } from 'react'

export default function IncidentCard({ incident }) {
  const [open, setOpen] = useState(false)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (!open) return
    const u1 = listenTimeline(incident.id, setTimeline)
    return () => {
      u1()
    }
  }, [open, incident.id])

  const created = tsToDate(incident.createdAt)

  return (
    <div className={`rounded-2xl border ${incident.status === 'active' ? 'border-neutral-700' : 'border-neutral-800'} bg-neutral-900/60 overflow-hidden`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-4 text-left">
        <div className="flex items-center gap-3">
          <AlertBadge level={incident.level} />
          {incident.status !== 'active' && (
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide">{incident.status}</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-neutral-500 text-[12px]">{created ? created.toLocaleTimeString() : 'just now'}</p>
          <p className="text-neutral-600 text-[11px]">{open ? 'Hide' : 'Details'}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 animate-fadeIn">
          <LiveMap location={incident.location} />
          <LocationVault location={incident.location} timeline={timeline} />
          {incident.status === 'active' && (
            <button
              onClick={() => resolveIncident(incident.id)}
              className="key h-11 rounded-xl bg-neutral-800 text-white text-[13px] font-medium active:bg-neutral-700"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  )
}
