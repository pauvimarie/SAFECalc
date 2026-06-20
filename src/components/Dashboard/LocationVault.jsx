import { tsToDate } from '../../firebase/firestore'

function formatCoords(location) {
  if (!location) return 'No location captured'
  const lat = location.lat.toFixed(6)
  const lng = location.lng.toFixed(6)
  const acc = location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ''
  return `${lat}, ${lng}${acc}`
}

export default function LocationVault({ location, photo, soundCheck, timeline }) {
  const hasLocation = location && location.lat && location.lng

  return (
    <div className="space-y-4">
      {/* Last Known Location */}
      <div>
        <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Last Known Location</p>
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          <p className="text-[13px] text-white font-mono">{formatCoords(location)}</p>
          {hasLocation && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=16`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 text-[12px] mt-2 inline-block hover:underline"
            >
              Open in map →
            </a>
          )}
        </div>
      </div>

      {/* Photo Snapshot (danger / critical only) */}
      {photo && (
        <div>
          <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Photo Snapshot</p>
          <img src={photo} alt="Captured at trigger" className="rounded-xl border border-neutral-800 w-full max-w-[240px]" />
        </div>
      )}

      {/* Ambient Check (assistance / danger / critical only) */}
      {soundCheck && (
        <div>
          <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Ambient Check</p>
          <div
            className={`rounded-xl border p-4 text-[13px] ${
              soundCheck.detected
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            {soundCheck.detected ? `Loud sound detected · peak ${soundCheck.peak}` : 'Quiet at time of trigger'}
          </div>
        </div>
      )}

      {/* Alert History */}
      <div>
        <p className="text-neutral-400 text-[12px] font-medium mb-2 uppercase tracking-wide">Alert History</p>
        {timeline && timeline.length > 0 ? (
          <div className="flex flex-col gap-0">
            {timeline.map((e, i) => (
              <div key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-neutral-700" />}
                </div>
                <div className="pb-3">
                  <p className="text-[13px] text-white">{e.message}</p>
                  <p className="text-[11px] text-neutral-500">
                    {tsToDate(e.timestamp)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-[13px]">No timeline events yet.</p>
        )}
      </div>
    </div>
  )
}
