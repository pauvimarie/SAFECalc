const LEVELS = {
  concern: { emoji: '🟢', label: 'Concern', ring: 'ring-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  assistance: { emoji: '🟡', label: 'Assistance', ring: 'ring-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  danger: { emoji: '🟠', label: 'Danger', ring: 'ring-orange-500/40', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  critical: { emoji: '🔴', label: 'Critical', ring: 'ring-red-500/40', text: 'text-red-400', bg: 'bg-red-500/10' },
}

export default function AlertBadge({ level, size = 'md' }) {
  const cfg = LEVELS[level] || LEVELS.concern
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 ${cfg.ring} ${cfg.bg} ${cfg.text} ${pad} font-medium`}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}

export { LEVELS }
