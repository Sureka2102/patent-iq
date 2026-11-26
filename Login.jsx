import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FileSearch, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function InputField({ label, type, value, onChange, placeholder, showToggle, show, onToggle, dark }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: dark ? '#525252' : '#737373', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          required value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: showToggle ? '13px 46px 13px 16px' : '13px 16px',
            borderRadius: 10,
            border: `1.5px solid ${focused ? (dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') : (dark ? '#1e1e1e' : '#e5e5e5')}`,
            background: focused ? (dark ? '#0f0f0f' : '#fafafa') : (dark ? '#080808' : '#ffffff'),
            color: dark ? '#fff' : '#000', fontSize: 14, transition: 'all 0.2s var(--ease)',
            boxShadow: focused ? (dark ? '0 0 0 3px rgba(255,255,255,0.05)' : '0 0 0 3px rgba(0,0,0,0.06)') : 'none',
          }}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: dark ? '#404040' : '#a3a3a3', display: 'flex', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = dark ? '#737373' : '#525252'}
            onMouseLeave={e => e.currentTarget.style.color = dark ? '#404040' : '#a3a3a3'}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#000' : '#fff', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,0,0,0.025) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'} 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Left: Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', borderRight: `1px solid ${dark ? '#0e0e0e' : '#f0f0f0'}`, position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 420 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
            <div style={{ width: 38, height: 38, background: dark ? '#fff' : '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <FileSearch size={20} color={dark ? '#000' : '#fff'} />
            </div>
            <span style={{ color: dark ? '#fff' : '#000', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>
              Patent<span style={{ color: dark ? '#404040' : '#a3a3a3' }}>IQ</span>
            </span>
          </Link>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: dark ? '#fff' : '#000', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 10 }}>
              Sign in to your account
            </h1>
            <p style={{ color: dark ? '#404040' : '#737373', fontSize: 14, lineHeight: 1.6 }}>
              AI-powered patent novelty assessment for your projects
            </p>
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InputField
              label="Email address" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              dark={dark}
            />
            <InputField
              label="Password" showToggle show={showPass} onToggle={() => setShowPass(p => !p)}
              placeholder="Enter your password"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              dark={dark}
            />

            <button type="submit" disabled={loading} style={{
              marginTop: 6, padding: '14px', borderRadius: 10,
              background: loading ? (dark ? '#e5e5e5' : '#d4d4d4') : (dark ? '#fff' : '#000'),
              color: dark ? '#000' : '#fff',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s var(--ease)',
              boxShadow: dark ? '0 4px 16px rgba(255,255,255,0.1)' : '0 4px 16px rgba(0,0,0,0.15)',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.1)' }}
            >
              {loading
                ? <><div className="spin" style={{ borderColor: '#d4d4d4', borderTopColor: '#000' }} /> Signing in...</>
                : <>Sign In <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p style={{ marginTop: 28, color: dark ? '#404040' : '#737373', fontSize: 13, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: dark ? '#fff' : '#000', fontWeight: 700, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Create one free →</Link>
          </p>
        </div>
      </div>

      {/* Right: Info panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', background: dark ? '#040404' : '#f9f9f9', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, border: `1px solid ${dark ? '#1e1e1e' : '#e5e5e5'}`, color: dark ? '#525252' : '#737373', fontSize: 11, fontWeight: 700, marginBottom: 28, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Multi-Agent AI System
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: dark ? '#fff' : '#000', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 32 }}>
            Assess patent novelty with 8 specialized AI agents
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
            {[
              { step: '01', title: 'Upload Document', desc: 'PDF, DOCX, or PPTX — any project document' },
              { step: '02', title: 'AI Pipeline Runs', desc: '8 agents analyze features, innovations & similarity' },
              { step: '03', title: 'Get Novelty Score', desc: 'Receive scored report with patent recommendations' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  border: `1px solid ${dark ? '#1e1e1e' : '#e5e5e5'}`, background: dark ? '#0a0a0a' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: dark ? '#525252' : '#a3a3a3', fontFamily: 'var(--mono)', letterSpacing: '0.04em',
                }}>{step}</div>
                <div>
                  <div style={{ fontWeight: 700, color: dark ? '#fff' : '#000', fontSize: 14, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: dark ? '#404040' : '#737373', fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '20px', borderRadius: 14, border: `1px solid ${dark ? '#1a1a1a' : '#e5e5e5'}`, background: dark ? '#080808' : '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: dark ? '#404040' : '#a3a3a3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sample Analysis</span>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 700 }}>Completed</span>
            </div>
            {[['Novelty Score', '82 / 100'], ['Patentability', '74 / 100'], ['Similar Docs', '3 found']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${dark ? '#0e0e0e' : '#f0f0f0'}` }}>
                <span style={{ fontSize: 13, color: dark ? '#525252' : '#737373' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: dark ? '#fff' : '#000', fontFamily: 'var(--mono)' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
              <CheckCircle size={14} color="#16a34a" />
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>High Patent Potential — Recommend filing provisional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
