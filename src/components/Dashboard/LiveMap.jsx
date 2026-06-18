export default function LiveMap({ location }) {
  if (!location) {
    return (
      <div className="h-44 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <p className="text-neutral-500 text-[13px]">Waiting for location…</p>
      </div>
    )
  }

  const { lat, lng } = location
  const d = 0.006
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800">
      <iframe
        title="Live location"
        src={src}
        className="w-full h-44 grayscale-0"
        loading="lazy"
        style={{ border: 0 }}
      />
      <div className="flex items-center justify-between bg-neutral-900 px-3 py-2">
        <span className="text-neutral-400 text-[12px] font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-400 text-[12px] font-medium"
        >
          Open in Maps →
        </a>
      </div>
    </div>
  )
}
