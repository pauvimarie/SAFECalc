const STYLES = {
  digit: 'bg-[#333333] text-white active:bg-[#4d4d4d]',
  function: 'bg-[#a5a5a5] text-black active:bg-[#c7c7c7]',
  operator: 'bg-[#ff9f0a] text-white active:bg-[#ffb84d]',
}

export default function CalcButton({ label, onPress, variant = 'digit', wide = false, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel || String(label)}
      onClick={onPress}
      className={[
        'key select-none rounded-full flex items-center justify-center',
        'text-[28px] font-medium leading-none',
        'h-[72px]',
        wide ? 'col-span-2 justify-start pl-7' : 'aspect-square',
        STYLES[variant],
      ].join(' ')}
    >
      {label}
    </button>
  )
}
