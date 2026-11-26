import { Upload, Loader, CheckCircle, XCircle } from 'lucide-react'

const cfg = {
  uploaded:   { label: 'Uploaded',   icon: Upload,      bg: '#f5f5f5', color: '#525252', border: '#e5e5e5', dot: '#d4d4d4' },
  processing: { label: 'Processing', icon: Loader,      bg: '#fff',    color: '#000',    border: '#e5e5e5', dot: '#000', pulse: true },
  completed:  { label: 'Completed',  icon: CheckCircle, bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#16a34a' },
  failed:     { label: 'Failed',     icon: XCircle,     bg: '#fff1f2', color: '#be123c', border: '#fecdd3', dot: '#dc2626' },
}

export default function StatusBadge({ status }) {
  const c = cfg[status] || cfg.uploaded
  const Icon = c.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0,
        animation: c.pulse ? 'pulse 1.2s ease infinite' : 'none',
      }} />
      {c.label}
    </span>
  )
}
