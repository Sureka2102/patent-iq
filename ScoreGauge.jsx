export default function ScoreGauge({ score = 0, label, size = 120 }) {
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(score, 0), 100)
  const offset = circ - (pct / 100) * circ
  const getColor = s => s >= 70 ? '#000' : s >= 40 ? '#525252' : '#d4d4d4'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f5f5f5" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={getColor(pct)} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: '#000', lineHeight: 1 }}>{Math.round(pct)}</span>
        <span style={{ fontSize: size * 0.10, color: '#737373', fontWeight: 500 }}>/100</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}
