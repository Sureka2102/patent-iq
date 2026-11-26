import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsAPI, reportsAPI } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import {
  FileText, CheckCircle, Clock, Upload, ArrowRight, Plus,
  TrendingUp, Activity, Zap, BarChart2, Target
} from 'lucide-react'

const analysisModules = [
  { title: 'Executive Summary', description: 'Summarizes the project goal, scope, technologies, and target users.', key: 'summary', icon: FileText },
  { title: 'Feature Extraction', description: 'Identifies the problem, objectives, features, technology stack, and architecture.', key: 'features', icon: Activity },
  { title: 'Innovation Detection', description: 'Highlights novel components and technical contributions.', key: 'innovations', icon: Zap },
  { title: 'Similarity Analysis', description: 'Searches locally indexed patent PDFs and compares uploaded projects; source details appear in the result.', key: 'similarity_analysis', icon: BarChart2 },
  { title: 'Novelty Assessment', description: 'Provides novelty and patentability scores with supporting reasoning.', key: 'novelty_reasoning', icon: Target },
  { title: 'Recommendations', description: 'Suggests improvements and next steps for patent preparation.', key: 'recommendations', icon: TrendingUp },
  { title: 'Final Assessment', description: 'Presents the overall verdict and generated report.', key: 'final_assessment', icon: CheckCircle },
]

function StatCard({ icon: Icon, value, label, sub, loading, trend }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', border: `1px solid ${hov ? '#d4d4d4' : '#e5e5e5'}`,
        borderRadius: 16, padding: '22px 22px',
        transition: 'all 0.2s var(--ease)',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, background: hov ? '#000' : '#f5f5f5', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <Icon size={18} color={hov ? '#fff' : '#525252'} />
        </div>
        {sub && <span style={{ fontSize: 10, fontWeight: 700, color: '#d4d4d4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{sub}</span>}
      </div>
      {loading ? (
        <div className="skel" style={{ height: 38, width: 80, marginBottom: 8 }} />
      ) : (
        <div style={{ fontSize: 38, fontWeight: 800, color: '#000', letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      )}
      <div style={{ fontSize: 13, color: '#737373', marginTop: 6, fontWeight: 500 }}>{label}</div>
      {trend && !loading && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
          <TrendingUp size={11} /> {trend}
        </div>
      )}
    </div>
  )
}


export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [projectsError, setProjectsError] = useState('')

  useEffect(() => {
    projectsAPI.list().then(r => {
      setProjects(r.data)
      setSelectedProjectId(current => current || r.data.find(p => p.status === 'completed')?.id || r.data[0]?.id || '')
      setProjectsError('')
    }).catch(() => {
      setProjectsError('Unable to load projects. Check your connection and try again.')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const hasProcessing = projects.some(p => p.status === 'processing')
    if (!hasProcessing) return
    const t = setInterval(() => {
      projectsAPI.list().then(r => {
        setProjects(r.data)
        setProjectsError('')
      }).catch(() => {
        setProjectsError('Project status could not be refreshed.')
      })
    }, 4000)
    return () => clearInterval(t)
  }, [projects])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  useEffect(() => {
    if (!selectedProject || selectedProject.status !== 'completed') {
      setReport(null)
      setReportError('')
      setReportLoading(false)
      return
    }

    let active = true
    setReport(null)
    setReportError('')
    setReportLoading(true)
    reportsAPI.get(selectedProject.id)
      .then(r => { if (active) setReport(r.data) })
      .catch(err => {
        if (active) setReportError(err.response?.data?.detail || 'Unable to load the analysis results.')
      })
      .finally(() => { if (active) setReportLoading(false) })

    return () => { active = false }
  }, [selectedProject?.id, selectedProject?.status])

  const total = projects.length
  const completed = projects.filter(p => p.status === 'completed').length
  const processing = projects.filter(p => p.status === 'processing').length
  const rate = total > 0 ? `${Math.round((completed / total) * 100)}%` : '—'
  const recent = projects.slice(0, 6)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 36 }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: '#000', borderRadius: 20, padding: '32px 36px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {/* bg grid */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-50%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#404040', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Overview</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>
                {greeting}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: '#525252', fontSize: 14 }}>Here's your patent assessment activity</p>
            </div>
            <Link to="/projects" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: '#fff', color: '#000',
              boxShadow: '0 4px 16px rgba(255,255,255,0.1)',
              transition: 'all 0.2s var(--ease)', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.1)' }}
            >
              <Plus size={15} /> New Assessment
            </Link>
          </div>
        </div>

        {projectsError && (
          <div role="alert" style={{ padding: '11px 14px', marginBottom: 16, borderRadius: 9, background: '#fff1f2', color: '#be123c', fontSize: 13 }}>
            {projectsError}
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon={FileText}    value={total}     label="Total Projects"    sub="All time"  loading={loading} />
          <StatCard icon={CheckCircle} value={completed} label="Reports Generated" sub="Completed" loading={loading} trend={completed > 0 ? `${completed} completed` : null} />
          <StatCard icon={Clock}       value={processing} label="In Progress"      sub="Active"    loading={loading} />
          <StatCard icon={BarChart2}   value={rate}      label="Completion Rate"   sub="Rate"      loading={loading} />
        </div>

        {/* ── Analysis modules ── */}
        <section style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 18, padding: 22, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#000' }}>7 Analysis Modules</h2>
              <p style={{ fontSize: 12, color: '#737373', marginTop: 4 }}>Select a completed project to inspect each module's result.</p>
              <p style={{ fontSize: 11, color: '#737373', marginTop: 5 }}>Novelty comparisons use the locally indexed patent library. Add patent PDFs from Patent Library to expand it.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {selectedProject && <StatusBadge status={selectedProject.status} />}
              {selectedProject?.status === 'completed' && (
                <Link to={`/report/${selectedProject.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#525252' }}>
                  Full report <ArrowRight size={13} />
                </Link>
              )}
              {projects.length > 0 && (
                <select
                  aria-label="Select project analysis"
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  style={{ maxWidth: 260, padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', color: '#262626', fontSize: 12 }}
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title} · {p.status}</option>)}
                </select>
              )}
            </div>
          </div>

          {selectedProject?.status === 'failed' && selectedProject.analysis_error && (
            <div role="status" style={{ padding: '10px 12px', marginBottom: 16, borderRadius: 9, background: '#fff1f2', color: '#be123c', fontSize: 12 }}>
              {selectedProject.analysis_error}
            </div>
          )}
          {reportError && (
            <div role="alert" style={{ padding: '10px 12px', marginBottom: 16, borderRadius: 9, background: '#fff1f2', color: '#be123c', fontSize: 12 }}>
              {reportError}
            </div>
          )}

          <div className="dashboard-analysis-grid">
            {analysisModules.map(({ title, description, key, icon: Icon }, index) => {
              const content = key === 'novelty_reasoning' && report
                ? `Novelty score: ${report.novelty_score ?? 'N/A'} / 100\nPatentability score: ${report.patentability_score ?? 'N/A'} / 100\n\n${report.novelty_reasoning || 'No reasoning available.'}`
                : report?.[key]
              return (
                <article key={key} style={{ border: '1px solid #e5e5e5', borderRadius: 13, padding: 16, background: '#fff', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={15} color="#404040" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#a3a3a3', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Module {index + 1}</div>
                      <h3 style={{ fontSize: 13, color: '#000', fontWeight: 750, marginTop: 2 }}>{title}</h3>
                    </div>
                  </div>
                  <p style={{ minHeight: 36, fontSize: 11, color: '#737373', lineHeight: 1.6 }}>{description}</p>
                  {reportLoading ? (
                    <div style={{ marginTop: 12, fontSize: 11, color: '#a3a3a3' }}>Loading result...</div>
                  ) : content ? (
                    <details style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                      <summary style={{ cursor: 'pointer', color: '#404040', fontSize: 11, fontWeight: 700 }}>View result</summary>
                      <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 9, color: '#525252', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{content}</div>
                    </details>
                  ) : (
                    <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 10, color: '#a3a3a3', fontSize: 11 }}>
                      {selectedProject?.status === 'completed' ? 'No result available for this module.' : 'Results appear here when analysis is complete.'}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
          {!selectedProject && !loading && (
            <div style={{ padding: '16px 0 2px', color: '#737373', fontSize: 12 }}>Upload a document to see its analysis in these modules.</div>
          )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          {/* ── Recent Projects ── */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>Recent Projects</h2>
                <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>Your latest patent assessments</p>
              </div>
              <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#a3a3a3', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#000'}
                onMouseLeave={e => e.currentTarget.style.color = '#a3a3a3'}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: 24 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid #fafafa' }}>
                    <div className="skel" style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skel" style={{ height: 14, width: '50%', marginBottom: 7 }} />
                      <div className="skel" style={{ height: 11, width: '28%' }} />
                    </div>
                    <div className="skel" style={{ height: 22, width: 80, borderRadius: 99 }} />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: '#f5f5f5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #efefef' }}>
                  <Upload size={22} color="#a3a3a3" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 6 }}>No projects yet</div>
                <div style={{ fontSize: 13, color: '#a3a3a3', marginBottom: 20 }}>Upload your first document to run an AI novelty assessment</div>
                <Link to="/projects" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: '#000', color: '#fff',
                }}>
                  <Plus size={13} /> Upload Document
                </Link>
              </div>
            ) : (
              recent.map((p, i) => (
                <div key={p.id} style={{
                  padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
                  borderTop: i === 0 ? 'none' : '1px solid #fafafa',
                  transition: 'background 0.12s', cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 42, height: 42, background: '#f5f5f5', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #efefef' }}>
                    <FileText size={17} color="#525252" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 3 }}>
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={p.status} />
                    {p.status === 'completed' && (
                      <Link to={`/report/${p.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
                        color: '#525252', padding: '5px 11px', border: '1px solid #e5e5e5', borderRadius: 7,
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#525252'; e.currentTarget.style.background = 'transparent' }}
                      >
                        Report <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Quick actions */}
            <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: Plus, label: 'New Assessment', sub: 'Upload a document', to: '/projects', dark: true },
                  { icon: FileText, label: 'View All Projects', sub: 'Manage assessments', to: '/projects', dark: false },
                ].map(({ icon: Icon, label, sub, to, dark }) => (
                  <Link key={label} to={to} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                    borderRadius: 11, background: dark ? '#000' : '#fafafa',
                    border: `1px solid ${dark ? 'transparent' : '#f0f0f0'}`,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; if (!dark) e.currentTarget.style.borderColor = '#e5e5e5' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; if (!dark) e.currentTarget.style.borderColor = '#f0f0f0' }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: dark ? '#fff' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={dark ? '#000' : '#525252'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: dark ? '#fff' : '#000' }}>{label}</div>
                      <div style={{ fontSize: 11, color: dark ? '#525252' : '#a3a3a3', marginTop: 1 }}>{sub}</div>
                    </div>
                    <ArrowRight size={13} color={dark ? '#525252' : '#d4d4d4'} style={{ marginLeft: 'auto' }} />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
