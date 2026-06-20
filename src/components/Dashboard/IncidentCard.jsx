import { useState, useEffect } from 'react'
import AlertBadge from './AlertBadge'
import LiveMap from './LiveMap'
import LocationVault from './LocationVault'
import { listenTimeline, tsToDate, resolveIncident, acknowledgeIncident } from '../../firebase/firestore'

export default function IncidentCard({ incident, isNewest = false }) {
  const [open, setOpen] = useState(false)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (!open) return
    const u1 = listenTimeline(incident.id, setTimeline)
    return () => {
      u1()
    }
  }, [open, incident.id])

  // Read-receipt: mark acknowledged the first time a guardian opens an active incident.
  useEffect(() => {
    if (open && incident.status === 'active' && !incident.acknowledged) {
      acknowledgeIncident(incident.id).catch((err) => console.error('Acknowledge failed:', err))
    }
  }, [open, incident.id, incident.status, incident.acknowledged])

  const created = tsToDate(incident.createdAt)

  return (
    <div
      className={[
        'rounded-2xl border bg-neutral-900/60 overflow-hidden',
        isNewest && incident.status === 'active'
          ? 'border-emerald-500/60 ring-2 ring-emerald-500/30 animate-newAlert'
          : incident.status === 'active'
          ? 'border-neutral-700'
          : 'border-neutral-800',
      ].join(' ')}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-4 text-left">
        <div className="flex items-center gap-3">
          <AlertBadge level={incident.level} />
          {isNewest && incident.status === 'active' && (
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">New</span>
          )}
          {incident.status !== 'active' && (
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide">{incident.status}</span>
          )}
          {incident.acknowledged && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">✓ Delivered</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-neutral-500 text-[12px]">{created ? created.toLocaleTimeString() : 'just now'}</p>
          <p className="text-neutral-600 text-[11px]">{open ? 'Hide' : 'Details'}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 animate-fadeIn">
          {incident.acknowledged && (
            <p className="text-[12px] text-emerald-400">Guardian received alert ✓ Delivered</p>
          )}
          <LiveMap location={incident.location} />
          <LocationVault location={incident.location} photo={incident.photo} soundCheck={incident.soundCheck} timeline={timeline} />
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
