import { tsToDate } from '../../firebase/firestore'

function timeStr(ts) {
  const d = tsToDate(ts)
  if (!d) return '…'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function Timeline({ events }) {
  if (!events.length) {
    return <p className="text-neutral-500 text-[13px]">No timeline events yet.</p>
  }
  return (
    <div className="flex flex-col gap-0">
      {events.map((e, i) => (
        <div key={e.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-neutral-700" />}
          </div>
          <div className="pb-3">
            <p className="text-[13px] text-white">{e.message}</p>
            <p className="text-[11px] text-neutral-500">{timeStr(e.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
