export default function EvidenceList({ evidence }) {
  if (!evidence.length) {
    return <p className="text-neutral-500 text-[13px]">No evidence uploaded yet.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {evidence.map((e) => (
        <div key={e.id} className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
          {e.type === 'photo' ? (
            <img src={e.url} alt="Captured evidence" className="w-full h-28 object-cover" />
          ) : (
            <div className="p-3">
              <p className="text-[12px] text-neutral-400 mb-2">Audio recording</p>
              <audio controls src={e.url} className="w-full h-8" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
