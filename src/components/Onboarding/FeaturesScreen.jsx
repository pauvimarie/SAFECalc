const FEATURES = [
  { title: 'Discreet emergency activation', desc: 'Trigger help from inside a calculator that looks completely normal.' },
  { title: 'Trusted contact alerts', desc: 'The people you choose are notified the moment you need them.' },
  { title: 'Evidence preservation', desc: 'Photos, audio, and location are saved securely as they happen.' },
  { title: 'Live location sharing', desc: 'Your guardians can see where you are for as long as it matters.' },
]

export default function FeaturesScreen({ onContinue }) {
  return (
    <div className="h-full flex flex-col px-7 py-12 bg-black text-white animate-fadeIn">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">What SAFECalc Does</h1>
      <div className="flex-1 flex flex-col gap-5">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="flex gap-4 items-start animate-slideUp" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-[17px]">{f.title}</p>
              <p className="text-neutral-400 text-[15px] leading-snug mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="key w-full h-14 rounded-2xl bg-emerald-500 text-black font-semibold text-[17px] active:bg-emerald-400"
      >
        Continue
      </button>
    </div>
  )
}
