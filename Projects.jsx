import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { projectsAPI, analysisAPI } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { Upload, FileText, ArrowRight, X, CheckCircle, File, Zap, AlertCircle, FolderOpen } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [running, setRunning] = useState({})
  const [file, setFile] = useState(null)
  const [projectsError, setProjectsError] = useState('')

  const fetchProjects = () => projectsAPI.list()
    .then(r => {
      setProjects(r.data)
      setProjectsError('')
    })
    .catch(() => setProjectsError('Unable to load project data. Check your connection and try again.'))

  useEffect(() => { fetchProjects().finally(() => setLoading(false)) }, [])

  useEffect(() => {
    const hasProcessing = projects.some(p => p.status === 'processing')
    if (!hasProcessing) return
    const t = setInterval(fetchProjects, 4000)
    return () => clearInterval(t)
  }, [projects])

  const onDrop = useCallback(files => { if (files[0]) setFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await projectsAPI.upload(fd)
      toast.success('Document uploaded!')
      setFile(null)
      await fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRun = async (id) => {
    setRunning(p => ({ ...p, [id]: true }))
    try {
      await analysisAPI.run(id)
      toast.success('Analysis pipeline started')
      await fetchProjects()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start')
    } finally {
      setRunning(p => ({ ...p, [id]: false }))
    }
  }

  const ext = file ? file.name.split('.').pop().toUpperCase() : ''
  const sizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : 0

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 36 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 6 }}>Projects</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', letterSpacing: '-0.04em' }}>Patent Assessments</h1>
          <p style={{ color: '#737373', marginTop: 6, fontSize: 14 }}>Upload documents and run the AI novelty assessment pipeline</p>
        </div>

        {projectsError && (
          <div role="alert" style={{ padding: '11px 14px', marginBottom: 16, borderRadius: 9, background: '#fff1f2', color: '#be123c', fontSize: 13 }}>
            {projectsError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          {/* Project list */}
          <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>All Projects</h2>
                <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>{projects.length} document{projects.length !== 1 ? 's' : ''} uploaded</p>
              </div>
              {projects.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a3a3a3' }}>
                  <FolderOpen size={14} />
                  {projects.filter(p => p.status === 'completed').length} completed
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 24 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #fafafa' }}>
                    <div className="skel" style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skel" style={{ height: 14, width: '55%', marginBottom: 8 }} />
                      <div className="skel" style={{ height: 11, width: '32%' }} />
                    </div>
                    <div className="skel" style={{ height: 26, width: 88, borderRadius: 99 }} />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: '72px 24px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: '#f5f5f5', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #efefef' }}>
                  <FileText size={26} color="#a3a3a3" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#000', marginBottom: 6 }}>No projects yet</div>
                <div style={{ fontSize: 13, color: '#a3a3a3' }}>Upload your first document using the panel →</div>
              </div>
            ) : (
              projects.map((p, i) => (
                <div key={p.id} style={{
                  padding: '15px 24px', display: 'flex', alignItems: 'center', gap: 14,
                  borderTop: i === 0 ? 'none' : '1px solid #fafafa',
                  transition: 'background 0.12s', cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #efefef' }}>
                    <FileText size={18} color="#525252" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 3 }}>
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {p.status === 'failed' && (
                      <div role="status" style={{ fontSize: 12, color: '#be123c', marginTop: 6 }}>
                        {p.analysis_error || 'Analysis failed. Check the backend logs for details.'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge status={p.status} />
                    {p.status === 'uploaded' && (
                      <button onClick={() => handleRun(p.id)} disabled={running[p.id]} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        background: '#000', color: '#fff',
                        fontSize: 12, fontWeight: 700, cursor: running[p.id] ? 'not-allowed' : 'pointer',
                        opacity: running[p.id] ? 0.6 : 1, transition: 'all 0.15s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                        onMouseEnter={e => { if (!running[p.id]) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)' } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)' }}
                      >
                        {running[p.id]
                          ? <><div className="spin spin-white" style={{ width: 12, height: 12 }} /> Running...</>
                          : <><Zap size={12} /> Analyze</>
                        }
                      </button>
                    )}
                    {p.status === 'completed' && (
                      <Link to={`/report/${p.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 13px', borderRadius: 8,
                        border: '1.5px solid #e5e5e5', fontSize: 12, fontWeight: 700, color: '#525252',
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.color = '#000'; e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#525252'; e.currentTarget.style.background = 'transparent' }}
                      >
                        View Report <ArrowRight size={12} />
                      </Link>
                    )}
                    {p.status === 'failed' && (
                      <button onClick={() => handleRun(p.id)} disabled={running[p.id]} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 13px', borderRadius: 8,
                        background: '#fff1f2', color: '#be123c', border: '1.5px solid #fecdd3',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                        <AlertCircle size={11} /> Retry
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upload panel */}
          <div style={{ position: 'sticky', top: 78 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid #f5f5f5' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>Upload Document</h2>
                <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>PDF, DOCX, PPTX · Max 50MB</p>
              </div>
              <div style={{ padding: '20px 22px' }}>
                {/* Dropzone */}
                <div {...getRootProps()} style={{
                  border: `2px dashed ${isDragActive ? '#000' : file ? '#000' : '#e5e5e5'}`,
                  borderRadius: 14, padding: '32px 16px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s var(--ease)',
                  background: isDragActive ? '#fafafa' : file ? '#fafafa' : '#fff',
                  boxShadow: isDragActive ? 'inset 0 0 0 4px rgba(0,0,0,0.03)' : 'none',
                }}>
                  <input {...getInputProps()} />
                  {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, height: 52, background: '#000', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                        <File size={24} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#000', wordBreak: 'break-all', maxWidth: 220 }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 3 }}>{ext} · {sizeMB} MB</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#15803d', background: '#f0fdf4', padding: '5px 12px', borderRadius: 99, border: '1px solid #bbf7d0' }}>
                        <CheckCircle size={12} /> Ready to upload
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, height: 52, background: isDragActive ? '#000' : '#f5f5f5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: '1px solid #efefef' }}>
                        <Upload size={22} color={isDragActive ? '#fff' : '#a3a3a3'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
                          {isDragActive ? 'Drop your file here' : 'Drag & drop or click to browse'}
                        </div>
                        <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 4 }}>PDF, DOCX, PPTX accepted</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={handleUpload} disabled={!file || uploading} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: (!file || uploading) ? '#f5f5f5' : '#000',
                    color: (!file || uploading) ? '#a3a3a3' : '#fff',
                    cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s var(--ease)',
                    boxShadow: file && !uploading ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  }}
                    onMouseEnter={e => { if (file && !uploading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = file && !uploading ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}
                  >
                    {uploading
                      ? <><div className="spin spin-white" style={{ width: 14, height: 14 }} /> Uploading...</>
                      : <><Upload size={14} /> Upload Document</>
                    }
                  </button>
                  {file && (
                    <button onClick={() => setFile(null)} style={{
                      width: 40, height: 40, borderRadius: 10, border: '1.5px solid #e5e5e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#a3a3a3', flexShrink: 0, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fff1f2' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#a3a3a3'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Supported formats */}
                <div style={{ marginTop: 18, padding: '14px 16px', background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Supported Formats</div>
                  {[
                    { fmt: 'PDF', desc: 'Research papers, reports' },
                    { fmt: 'DOCX', desc: 'Word documents, SRS' },
                    { fmt: 'PPTX', desc: 'Presentations, slides' },
                  ].map(({ fmt, desc }) => (
                    <div key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, background: '#000', color: '#fff', padding: '3px 7px', borderRadius: 5, fontFamily: 'var(--mono)', flexShrink: 0, letterSpacing: '0.04em' }}>{fmt}</span>
                      <span style={{ fontSize: 12, color: '#737373' }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
