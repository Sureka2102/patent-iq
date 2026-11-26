import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reportsAPI, projectsAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Download, BookOpen, FileText, Lightbulb,
  GitCompare, Target, Star, Award, ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react'

function ScoreCircle({ score, label, size = 130, color = '#000' }) {
  const [animated, setAnimated] = useState(0)
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const hasScore = Number.isFinite(score)
  const pct = hasScore ? Math.min(Math.max(score, 0), 100) : 0
  const offset = circ - (animated / 100) * circ

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 150)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={9}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.23, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{hasScore ? Math.round(pct) : '—'}</span>
          <span style={{ fontSize: size * 0.10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 2 }}>{hasScore ? '/100' : 'N/A'}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function AnalysisContent({ content }) {
  const parts = (content || 'No data available for this section.').split(/(https?:\/\/[^\s]+)/g)
  return (
    <p style={{ fontSize: 14, color: '#404040', lineHeight: 1.9, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {parts.map((part, index) => part.startsWith('http')
        ? <a key={index} href={part} target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', textDecoration: 'underline' }}>{part}</a>
        : part
      )}
    </p>
  )
}

function Section({ icon: Icon, title, content, badge, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: '1px solid #e5e5e5', borderRadius: 14, overflow: 'hidden',
      background: '#fff', transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#d4d4d4' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e5e5' }}
    >
      <button onClick={() => setOpen(p => !p)} style={{
        width: '100%', padding: '17px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', cursor: 'pointer',
        borderBottom: open ? '1px solid #f5f5f5' : 'none',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: open ? '#000' : '#f5f5f5', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
            <Icon size={15} color={open ? '#fff' : '#525252'} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: open ? '#000' : '#f5f5f5', color: open ? '#fff' : '#737373', transition: 'all 0.2s' }}>{badge}</span>
          )}
        </div>
        <div style={{ color: '#a3a3a3', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(0deg)' }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>
      {open && (
        <div style={{ padding: '22px 22px', animation: 'fadeIn 0.2s ease' }}>
          <AnalysisContent content={content} />
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, score, desc, color }) {
  const [animated, setAnimated] = useState(0)
  const hasScore = Number.isFinite(score)
  useEffect(() => { const t = setTimeout(() => setAnimated(hasScore ? score : 0), 200); return () => clearTimeout(t) }, [score, hasScore])
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>{label}</span>
          {desc && <span style={{ fontSize: 12, color: '#a3a3a3', marginLeft: 8 }}>{desc}</span>}
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: 'var(--mono)' }}>{hasScore ? Math.round(score) : 'N/A'}</span>
      </div>
      <div style={{ height: 7, background: '#f5f5f5', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${animated}%`, background: color, borderRadius: 99, transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
    </div>
  )
}

export default function Report() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setReport(null)
    setProject(null)
    setLoadError('')
    reportsAPI.get(id)
      .then(rRes => {
        if (!active) return
        setReport(rRes.data)
        projectsAPI.list()
          .then(pRes => {
            if (active) setProject(pRes.data.find(p => p.id === id) || null)
          })
          .catch(() => {
            if (active) setProject(null)
          })
      })
      .catch(err => {
        if (active) setLoadError(err.response?.data?.detail || 'Unable to load this report. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [id])

  const handleDownload = async () => {
    let url
    try {
      const response = await reportsAPI.download(id)
      url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `patentiq_report_${id}.pdf`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Report downloaded!')
    } catch {
      if (url) URL.revokeObjectURL(url)
      toast.error('Download failed')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spin spin-lg" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 14, color: '#737373', fontWeight: 500 }}>Loading report...</div>
      </div>
    </div>
  )

  if (!report) return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div role={loadError ? 'alert' : undefined} style={{ fontSize: 17, fontWeight: 700, color: '#000', marginBottom: 10 }}>
          {loadError || 'Report not found'}
        </div>
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#737373' }}>
          <ArrowLeft size={13} /> Back to Projects
        </Link>
      </div>
    </div>
  )

  const novelty = Number.isFinite(report.novelty_score) ? report.novelty_score : null
  const patentability = Number.isFinite(report.patentability_score) ? report.patentability_score : null
  const avg = novelty !== null && patentability !== null ? Math.round((novelty + patentability) / 2) : null
  const verdict = avg === null
    ? { label: 'Scores unavailable', color: '#525252', bg: '#f5f5f5', border: '#e5e5e5', ring: '#a3a3a3' }
    : avg >= 70
    ? { label: 'High Patent Potential', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', ring: '#22c55e' }
    : avg >= 40
    ? { label: 'Moderate Potential', color: '#a16207', bg: '#fefce8', border: '#fde047', ring: '#f59e0b' }
    : { label: 'Low Potential', color: '#be123c', bg: '#fff1f2', border: '#fecdd3', ring: '#f87171' }

  const scoreColor = (s) => s === null ? '#a3a3a3' : s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#f87171'

  const sections = [
    { icon: FileText,   title: 'Extracted Features & Technology Stack', content: report.features,           badge: 'Features',    defaultOpen: true },
    { icon: Lightbulb,  title: 'Detected Innovations & Novel Components', content: report.innovations,       badge: 'Innovations' },
    { icon: GitCompare, title: 'Similarity Analysis',                     content: report.similarity_analysis, badge: 'Similarity' },
    { icon: Target,     title: 'Novelty Assessment Reasoning',            content: report.novelty_reasoning,  badge: 'Reasoning'   },
    { icon: Star,       title: 'Patent Recommendations',                  content: report.recommendations,   badge: 'Actions'     },
    { icon: Award,      title: 'Final Assessment & Verdict',              content: report.final_assessment,  badge: 'Verdict'     },
  ]

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Sub-header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 58, zIndex: 90 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#a3a3a3', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#000'}
              onMouseLeave={e => e.currentTarget.style.color = '#a3a3a3'}
            >
              <ArrowLeft size={14} /> Projects
            </Link>
            <span style={{ color: '#e5e5e5' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#000', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project?.title || 'Report'}
            </span>
          </div>
          <button onClick={handleDownload} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: '#000', color: '#fff', cursor: 'pointer',
            transition: 'all 0.2s var(--ease)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* ── Score Hero ── */}
        <div style={{
          background: '#000', borderRadius: 22, padding: '36px 40px',
          marginBottom: 16, position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${verdict.ring}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#404040', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Assessment Complete</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 16 }}>
                {project?.title || 'Patent Report'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ padding: '5px 14px', borderRadius: 99, background: verdict.bg, color: verdict.color, border: `1px solid ${verdict.border}`, fontSize: 12, fontWeight: 700 }}>
                  {verdict.label}
                </span>
                {report.page_count && (
                  <span style={{ fontSize: 12, color: '#525252', fontWeight: 500 }}>{report.page_count} pages analyzed</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#404040' }}>
                <TrendingUp size={13} color="#525252" />
                Generated {new Date(report.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexShrink: 0 }}>
              <ScoreCircle score={novelty} label="Novelty Score" size={118} color={scoreColor(novelty)} />
              <div style={{ width: 1, height: 60, background: '#1a1a1a' }} />
              <ScoreCircle score={patentability} label="Patentability" size={118} color={scoreColor(patentability)} />
              <div style={{ width: 1, height: 60, background: '#1a1a1a' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 50, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums' }}>{avg ?? '—'}</div>
                <div style={{ fontSize: 11, color: '#525252', fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall</div>
              </div>
            </div>
          </div>
        </div>

        <div role="note" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#854d0e', fontSize: 12, lineHeight: 1.7 }}>
         This is an AI-generated novelty estimate based on the locally indexed patent corpus, not a legal opinion. Review the cited records; an incomplete corpus or no search match does not prove novelty.
        </div>

        {/* ── Score Breakdown ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: '22px 26px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 20 }}>Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ScoreBar label="Novelty Score" score={novelty} desc="Uniqueness vs. prior work" color={scoreColor(novelty)} />
            <ScoreBar label="Patentability Score" score={patentability} desc="Patent filing potential" color={scoreColor(patentability)} />
            <ScoreBar label="Overall Assessment" score={avg} desc="Combined evaluation" color={scoreColor(avg)} />
          </div>
        </div>

        {/* ── Executive Summary ── */}
        {report.summary && (
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: '22px 26px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>Executive Summary</div>
                <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 1 }}>AI-generated overview of the document</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#404040', lineHeight: 1.9 }}>{report.summary}</p>
          </div>
        )}

        {/* ── Accordion Sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {sections.map(s => <Section key={s.title} {...s} />)}
        </div>

        {/* ── Download CTA ── */}
        <div style={{
          background: '#000', borderRadius: 18, padding: '28px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>Download Full PDF Report</div>
            <div style={{ fontSize: 13, color: '#525252' }}>
              Professional report with all sections, scores and patent recommendations
            </div>
          </div>
          <button onClick={handleDownload} style={{
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            padding: '13px 26px', borderRadius: 11, fontSize: 14, fontWeight: 700,
            background: '#fff', color: '#000', cursor: 'pointer', position: 'relative', zIndex: 2,
            boxShadow: '0 4px 16px rgba(255,255,255,0.1)',
            transition: 'all 0.2s var(--ease)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.1)' }}
          >
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
