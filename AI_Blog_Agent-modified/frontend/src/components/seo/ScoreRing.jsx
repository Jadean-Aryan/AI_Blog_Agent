export default function ScoreRing({ score, size = 72, label = 'SEO Score' }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const s = score ?? 0
  const offset = circ - (s / 100) * circ
  const stroke = s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9"
          className="text-gray-100 dark:text-gray-800" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={stroke} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 50 50)" className="ring-animate transition-all duration-700"
          style={{ filter: `drop-shadow(0 0 4px ${stroke}50)` }} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
          fill={stroke} fontSize="22" fontWeight="700" fontFamily="system-ui">
          {Math.round(s)}
        </text>
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
    </div>
  )
}
