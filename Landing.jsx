import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FileSearch, ArrowRight, ChevronRight, Shield, Zap, BarChart2,
  FileText, Cpu, GitMerge, Download, TrendingUp, Lock, Globe
} from 'lucide-react'

function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = ts => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return val
}

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function ScrollProgress() {
  const [prog, setProg] = useState(0)
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      setProg((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    }
    window.addEventListener('scroll', update)
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'transparent' }}>
      <div style={{ height: '100%', width: `${prog}%`, background: 'linear-gradient(90deg,#fff,#a3a3a3)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

function StatCard({ value, suffix = '', label, start }) {
  const n = useCountUp(value, 1600, start)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {n}{suffix}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, delay, accent = '#fff' }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className={`anim-fadeUp delay-${delay}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#fff' : '#fafafa',
        border: `1px solid ${hov ? '#000' : '#e5e5e5'}`,
        borderRadius: 18, padding: '30px 26px',
        transition: 'all 0.25s var(--ease)',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 20px 60px rgba(0,0,0,0.1)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 48, height: 48, background: '#000', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        boxShadow: hov ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'box-shadow 0.25s',
      }}>
        <Icon size={22} color="#fff" />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#737373', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function AgentStep({ num, title, desc, isLast }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 20, position: 'relative' }}>
      {!isLast && (
        <div style={{ position: 'absolute', left: 20, top: 48, bottom: -24, width: 1, background: 'linear-gradient(#262626, transparent)' }} />
      )}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0, zIndex: 1,
          background: hov ? '#fff' : '#1a1a1a',
          border: `1px solid ${hov ? '#fff' : '#262626'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: hov ? '#000' : '#525252',
          fontFamily: 'var(--mono)', transition: 'all 0.2s',
        }}
      >{num}</div>
      <div style={{ paddingBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#525252', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [statsRef, statsInView] = useInView()
  const [featRef, featInView] = useInView()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const agents = [
    { num: '01', title: 'Document Parser', desc: 'Extracts and normalizes raw text from PDF, DOCX, PPTX' },
    { num: '02', title: 'Summarization Agent', desc: 'Generates executive summary, goals and project scope' },
    { num: '03', title: 'Feature Extractor', desc: 'Identifies problem statement, objectives and tech stack' },
    { num: '04', title: 'Innovation Detector', desc: 'Spots novel components and unique technical contributions' },
    { num: '05', title: 'Similarity Analyzer', desc: 'Vector search across ChromaDB for prior art matching' },
    { num: '06', title: 'Novelty Assessor', desc: 'Scores novelty and patentability 0–100 with reasoning' },
    { num: '07', title: 'Recommendation Agent', desc: 'Actionable steps to strengthen patent filing prospects' },
    { num: '08', title: 'Report Generator', desc: 'Compiles professional PDF with all findings and scores' },
  ]

  const features = [
    { icon: Cpu, title: 'LangGraph Orchestration', desc: 'True multi-agent pipeline with 8 specialized AI agents running in sequence using LangGraph.' },
    { icon: BarChart2, title: 'Dual Scoring System', desc: 'Separate Novelty Score and Patentability Score from 0–100 with full LLM reasoning.' },
    { icon: GitMerge, title: 'Vector Similarity Search', desc: 'ChromaDB-powered semantic search finds similar documents to measure originality.' },
    { icon: FileText, title: 'Multi-Format Support', desc: 'Upload PDF, DOCX, or PPTX — research papers, SRS docs, thesis, project reports.' },
    { icon: Shield, title: 'JWT Authentication', desc: 'Access is protected by JWT. Project text is sent to Groq for analysis; patent PDFs are stored in the local corpus.' },
    { icon: Download, title: 'PDF Report Export', desc: 'Download a fully formatted PDF with scores, innovation analysis and recommendations.' },
  ]

  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>
      <ScrollProgress />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        transition: 'all 0.35s var(--ease)',
      }}>
        <div className="container-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <FileSearch size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: scrolled ? '#000' : '#fff' }}>
              Patent<span style={{ color: scrolled ? '#737373' : 'rgba(255,255,255,0.45)' }}>IQ</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[['#features', 'Features'], ['#pipeline', 'Pipeline'], ['#limitations', 'Limitations'], ['#about', 'About']].map(([href, label]) => (
              <a key={href} href={href} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: scrolled ? '#525252' : 'rgba(255,255,255,0.6)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = scrolled ? '#000' : '#fff'; e.currentTarget.style.background = scrolled ? '#f5f5f5' : 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#525252' : 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent' }}
              >{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: scrolled ? '#525252' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = scrolled ? '#000' : '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#525252' : 'rgba(255,255,255,0.7)' }}
            >Sign in</Link>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: scrolled ? '#000' : '#fff',
              color: scrolled ? '#fff' : '#000',
              transition: 'all 0.2s var(--ease)',
              boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = scrolled ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}
            >
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: '#000', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: 130, paddingBottom: 100, position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        {/* Radial glows */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Badge */}
          <div className="anim-fadeUp" style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '6px 16px 6px 10px', borderRadius: 999,
              border: '1px solid #262626', background: '#0d0d0d',
              cursor: 'default',
            }}>
              <span style={{ background: 'linear-gradient(135deg,#fff,#a3a3a3)', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.06em' }}>NEW</span>
              <span style={{ fontSize: 13, color: '#737373', fontWeight: 500 }}>Multi-Agent AI Patent Assessment</span>
              <ChevronRight size={13} color="#525252" />
            </div>
          </div>

          {/* Headline */}
          <div className="anim-fadeUp delay-1" style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(44px, 7.5vw, 96px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.93, color: '#fff' }}>
              Patent Novelty<br />
              <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.12) 100%)' }}>Assessment,</span><br />
              Reimagined.
            </h1>
          </div>

          <div className="anim-fadeUp delay-2" style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.38)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75, fontWeight: 400 }}>
              Upload your project document. Our 8-agent AI pipeline analyzes it end-to-end and returns a novelty score, innovation breakdown, and patent filing recommendations.
            </p>
          </div>

          {/* CTAs */}
          <div className="anim-fadeUp delay-3" style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: '#fff', color: '#000',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.2), 0 16px 40px rgba(255,255,255,0.12)',
              transition: 'all 0.25s var(--ease)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3), 0 24px 60px rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2), 0 16px 40px rgba(255,255,255,0.12)' }}
            >
              Start free assessment <ArrowRight size={16} />
            </Link>
            <a href="#pipeline" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            >
              See how it works
            </a>
          </div>

          <div className="anim-fadeUp delay-4" style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 56, color: '#737373', fontSize: 12 }}>
            <span>Local patent corpus</span>
            <span>Preliminary AI estimates</span>
            <span>PDF · DOCX · PPTX input</span>
          </div>

          {/* Static workflow overview */}
          <div className="anim-fadeUp delay-4" style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{
              background: '#080808', border: '1px solid #1a1a1a', borderRadius: 20,
              overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            }}>
              <div style={{ padding: '13px 20px', borderBottom: '1px solid #141414', display: 'flex', alignItems: 'center', gap: 8, background: '#0a0a0a' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                <span style={{ fontSize: 12, color: '#737373', marginLeft: 10, fontFamily: 'var(--mono)' }}>Workflow overview — not a live analysis</span>
              </div>
              <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <div style={{ borderRight: '1px solid #141414', paddingRight: 28 }}>
                  <div style={{ fontSize: 10, color: '#737373', fontFamily: 'var(--mono)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Eight workflow nodes</div>
                  {agents.map(({ num, title }) => (
                    <div key={num} style={{ padding: '5px 0', borderBottom: '1px solid #0e0e0e', color: '#a3a3a3', fontSize: 12 }}>
                      <span style={{ marginRight: 10, color: '#525252', fontFamily: 'var(--mono)' }}>{num}</span>{title}
                    </div>
                  ))}
                </div>
                <div style={{ paddingLeft: 28, color: '#a3a3a3', fontSize: 13, lineHeight: 1.8 }}>
                  <div style={{ fontSize: 10, color: '#737373', fontFamily: 'var(--mono)', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How to interpret results</div>
                  {[
                    'Scores are preliminary AI estimates, not legal opinions.',
                    'Patent matches come only from PDFs indexed in the local library.',
                    'An empty search result does not establish novelty.',
                  ].map(text => (
                    <div key={text} style={{ padding: '12px 0', borderBottom: '1px solid #0e0e0e' }}>{text}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} style={{ background: '#000', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { value: 8, suffix: '', label: 'Specialized AI Agents' },
              { value: 3, suffix: '', label: 'Document Formats' },
              { value: 100, suffix: '', label: 'Max Novelty Score' },
              { value: 2, suffix: '', label: 'ChromaDB Collections' },
            ].map((s, i) => (
              <div key={i} style={{
                borderRight: i < 3 ? '1px solid #1a1a1a' : 'none',
                padding: '0 44px', textAlign: 'center',
              }}>
                <StatCard {...s} start={statsInView} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" ref={featRef} style={{ padding: '120px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="label" style={{ marginBottom: 14 }}>Features</div>
            <h2 className={`h1 ${featInView ? 'anim-fadeUp' : ''}`} style={{ maxWidth: 560, margin: '0 auto 18px' }}>
              Everything you need to assess patent novelty
            </h2>
            <p className="lead" style={{ maxWidth: 500, margin: '0 auto' }}>
              Built with LangGraph, ChromaDB, a pretrained embedding model, and a Groq-hosted language model.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={Math.min(i + 1, 6)} />)}
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section id="pipeline" style={{ padding: '120px 0', background: '#000' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#525252', marginBottom: 16 }}>The Pipeline</div>
              <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
                8 agents.<br />One seamless workflow.
              </h2>
              <p style={{ fontSize: 16, color: '#525252', lineHeight: 1.75, marginBottom: 40 }}>
                Each agent is specialized, stateless, and passes enriched context to the next — powered by LangGraph's directed graph orchestration.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 10,
                border: '1px solid #1a1a1a', background: '#0a0a0a',
                fontSize: 13, color: '#525252', fontFamily: 'var(--mono)',
              }}>
                <Globe size={14} color="#404040" />
                Upload → Parse → Analyze → Score → Report · local corpus
              </div>
            </div>
            <div style={{ paddingTop: 8 }}>
              {agents.map((a, i) => <AgentStep key={a.num} {...a} isLast={i === agents.length - 1} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="about" style={{ padding: '120px 0', background: '#fafafa' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="label" style={{ marginBottom: 16 }}>How It Works</div>
              <h2 className="h1" style={{ marginBottom: 22 }}>
                From document to patent report in minutes
              </h2>
              <p className="lead" style={{ marginBottom: 40 }}>
                PatentIQ reads your project document, understands its innovations, compares against existing work, and generates a detailed patent novelty report — fully automated.
              </p>
              {[
                { n: '1', title: 'Upload your document', desc: 'PDF, DOCX or PPTX — research paper, SRS, thesis, project report.' },
                { n: '2', title: 'AI agents analyze it', desc: '8 specialized agents run sequentially, each enriching the state.' },
                { n: '3', title: 'Download your report', desc: 'Get a scored PDF with novelty score, innovations and recommendations.' },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ display: 'flex', gap: 18, marginBottom: 28 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, border: '2px solid #000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0, background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>{n}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontSize: 14, color: '#737373', lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </div>
              ))}
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 11, fontSize: 15, fontWeight: 700,
                background: '#000', color: '#fff', marginTop: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.2s var(--ease)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)' }}
              >
                Try it now <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: FileText, label: 'Accepted documents', sub: 'PDF, DOCX, and PPTX' },
                { icon: Cpu, label: 'Analysis workflow', sub: 'Eight sequential LangGraph nodes' },
                { icon: TrendingUp, label: 'Score interpretation', sub: 'Preliminary AI estimate; not legal advice' },
                { icon: Download, label: 'Patent evidence', sub: 'Only records imported into the local library' },
              ].map(({ icon: Icon, label, sub }, i) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 22px', background: '#fff',
                  border: '1px solid #e5e5e5', borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  animation: `fadeUp 0.4s ${i * 0.1}s var(--ease) both`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="#525252" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Limitations ── */}
      <section id="limitations" style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div className="label" style={{ marginBottom: 14 }}>Scope</div>
            <h2 className="h1" style={{ maxWidth: 560, margin: '0 auto 18px' }}>
              Important limitations
            </h2>
            <p className="lead" style={{ maxWidth: 440, margin: '0 auto' }}>
              Review these points when interpreting a report or preparing a demonstration.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              ['Local patent corpus', 'Search results depend on the patent PDFs imported into this installation; the corpus may be incomplete.'],
              ['Preliminary scores', 'Novelty and patentability values are LLM-generated estimates, not legal opinions or calibrated predictions.'],
              ['Document text', 'Scanned PDFs without selectable text require OCR before they can be indexed; this app does not perform OCR.'],
            ].map(([title, description]) => (
              <article key={title} style={{ background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: 18, padding: '28px 26px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7 }}>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 0', background: '#000', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="anim-fadeUp" style={{ marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 16px', borderRadius: 999, border: '1px solid #262626',
              fontSize: 12, fontWeight: 700, color: '#525252', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <Lock size={11} /> Free to get started
            </div>
          </div>
          <h2 className="anim-fadeUp delay-1" style={{ fontSize: 'clamp(34px,5.5vw,72px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.95, marginBottom: 24 }}>
            Ready to assess your<br />patent novelty?
          </h2>
          <p className="anim-fadeUp delay-2" style={{ fontSize: 17, color: '#525252', maxWidth: 460, margin: '0 auto 52px', lineHeight: 1.75 }}>
            Upload a project document to receive an AI-generated assessment; processing time depends on the document and provider availability.
          </p>
          <div className="anim-fadeUp delay-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: '#fff', color: '#000',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.2), 0 16px 40px rgba(255,255,255,0.1)',
              transition: 'all 0.25s var(--ease)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.3), 0 24px 60px rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.2), 0 16px 40px rgba(255,255,255,0.1)' }}
            >
              Create free account <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '15px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#000', borderTop: '1px solid #0e0e0e', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSearch size={16} color="#000" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.03em' }}>
                Patent<span style={{ color: '#404040' }}>IQ</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Features', 'Pipeline', 'Limitations', 'About'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: '#404040', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#737373'}
                  onMouseLeave={e => e.currentTarget.style.color = '#404040'}
                >{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #0e0e0e', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#333' }}>
              © {new Date().getFullYear()} PatentIQ · Multi-Agent AI Patent Assessment System
            </div>
            <div style={{ fontSize: 12, color: '#333' }}>
              Privacy Policy and Terms of Service pages are not available in this demo.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
