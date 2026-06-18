export default function WelcomeScreen({ onGetStarted, onLearnMore }) {
  return (
    <div className="h-full flex flex-col justify-between px-8 py-12 bg-black text-white animate-fadeIn">
      <div />
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-2 shadow-lg shadow-emerald-900/40">
          <ShieldCalcGlyph />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">SAFECalc</h1>
        <p className="text-lg text-neutral-400 leading-snug">
          Looks normal.<br />Protects quietly.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={onGetStarted}
          className="key w-full h-14 rounded-2xl bg-emerald-500 text-black font-semibold text-[17px] active:bg-emerald-400"
        >
          Get Started
        </button>
        <button
          onClick={onLearnMore}
          className="key w-full h-14 rounded-2xl bg-neutral-800 text-white font-medium text-[17px] active:bg-neutral-700"
        >
          Learn More
        </button>
      </div>
    </div>
  )
}

function ShieldCalcGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
      <path d="M50 8 L82 20 V48 C82 68 68 84 50 92 C32 84 18 68 18 48 V20 Z" fill="white" fillOpacity="0.95" />
      <rect x="36" y="32" width="28" height="34" rx="4" fill="#0D9488" />
      <rect x="40" y="37" width="20" height="7" rx="2" fill="white" />
      <circle cx="44" cy="52" r="2.4" fill="white" />
      <circle cx="50" cy="52" r="2.4" fill="white" />
      <circle cx="56" cy="52" r="2.4" fill="white" />
      <circle cx="44" cy="59" r="2.4" fill="white" />
      <circle cx="50" cy="59" r="2.4" fill="white" />
    </svg>
  )
}
