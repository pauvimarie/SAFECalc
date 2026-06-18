function fontSizeFor(display) {
  const len = display.length
  if (len <= 7) return 'text-[88px]'
  if (len <= 9) return 'text-[64px]'
  if (len <= 11) return 'text-[48px]'
  return 'text-[36px]'
}

export default function Display({ value }) {
  return (
    <div className="flex-1 flex items-end justify-end px-6 pb-2 min-h-[120px]">
      <span
        className={[fontSizeFor(value), 'text-white font-light tracking-tight transition-all duration-150 truncate'].join(' ')}
        style={{ fontFamily: "-apple-system, 'SF Pro Display', sans-serif" }}
      >
        {value}
      </span>
    </div>
  )
}
