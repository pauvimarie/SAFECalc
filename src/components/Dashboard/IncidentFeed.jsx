import IncidentCard from './IncidentCard'

export default function IncidentFeed({ incidents, newestId }) {
  if (!incidents.length) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500 text-[14px]">No incidents yet.</p>
        <p className="text-neutral-600 text-[12px] mt-1">You'll see alerts here the moment one comes in.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {incidents.map((inc) => (
        <IncidentCard key={inc.id} incident={inc} isNewest={inc.id === newestId} />
      ))}
    </div>
  )
}
