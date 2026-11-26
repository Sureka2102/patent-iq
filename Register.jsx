import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FileSearch, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import toast from 'react-hot-toast'

function PasswordStrength({ password, dark }) {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['#dc2626', '#f59e0b', '#16a34a']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score - 1] : (dark ? '#1e1e1e' : '#e5e5e5'), transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map(({ label, ok }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: ok ? '#16a34a' : (dark ? '#404040' : '#a3a3a3'), transition: 'color 0.2s' }}>
            <Check size={10} strokeWidth={ok ? 3 : 2} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { register, login } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      try {
        await login(form.email, form.password)
      } catch {
        toast.error('Account created, but sign-in failed. Please sign in.')
        navigate('/login')
        return
      }
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'} 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.015)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center', width: '100%' }}>
          <div style={{ width: 36, height: 36, background: dark ? '#fff' : '#000', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <FileSearch size={19} color={dark ? '#000' : '#fff'} />
          </div>
          <span style={{ color: dark ? '#fff' : '#000', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>
            Patent<span style={{ color: dark ? '#404040' : '#a3a3a3' }}>IQ</span>
          </span>
        </Link>

        <div style={{ background: dark ? '#060606' : '#ffffff', border: `1px solid ${dark ? '#141414' : '#e5e5e5'}`, borderRadius: 20, padding: '40px 40px', boxShadow: dark ? '0 32px 80px rgba(0,0,0,0.6)' : '0 32px 80px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: dark ? '#fff' : '#000', letterSpacing: '-0.04em', marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: dark ? '#404040' : '#737373', fontSize: 14 }}>Start assessing patent novelty for free</p>
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FieldInput label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} dark={dark} />
            <FieldInput label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} dark={dark} />
            <div>
              <PasswordFieldInput
                label="Password" placeholder="Min. 6 characters"
                show={showPass} onToggle={() => setShowPass(p => !p)}
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                dark={dark}
              />
              <PasswordStrength password={form.password} dark={dark} />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: 8, padding: '14px', borderRadius: 10,
              background: loading ? (dark ? '#e5e5e5' : '#d4d4d4') : (dark ? '#fff' : '#000'),
              color: dark ? '#000' : '#fff',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s var(--ease)',
              boxShadow: dark ? '0 4px 16px rgba(255,255,255,0.1)' : '0 4px 16px rgba(0,0,0,0.15)',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              {loading
                ? <><div className="spin" style={{ borderColor: '#d4d4d4', borderTopColor: dark ? '#000' : '#fff' }} /> Creating account...</>
                : <>Create Account <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p style={{ marginTop: 24, color: dark ? '#404040' : '#737373', fontSize: 13, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: dark ? '#fff' : '#000', fontWeight: 700 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Sign in →</Link>
          </p>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: dark ? '#262626' : '#a3a3a3' }}>
          By creating an account you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

function FieldInput({ label, type, placeholder, value, onChange, dark }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: dark ? '#525252' : '#737373', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} required placeholder={placeholder}
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '13px 16px', borderRadius: 10,
          border: `1.5px solid ${focused ? (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)') : (dark ? '#1e1e1e' : '#e5e5e5')}`,
          background: focused ? (dark ? '#0f0f0f' : '#fafafa') : (dark ? '#080808' : '#ffffff'),
          color: dark ? '#fff' : '#000', fontSize: 14, transition: 'all 0.2s var(--ease)',
          boxShadow: focused ? (dark ? '0 0 0 3px rgba(255,255,255,0.05)' : '0 0 0 3px rgba(0,0,0,0.06)') : 'none',
        }}
      />
    </div>
  )
}

function PasswordFieldInput({ label, placeholder, show, onToggle, value, onChange, dark }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: dark ? '#525252' : '#737373', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'} required placeholder={placeholder}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '13px 46px 13px 16px', borderRadius: 10,
            border: `1.5px solid ${focused ? (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)') : (dark ? '#1e1e1e' : '#e5e5e5')}`,
            background: focused ? (dark ? '#0f0f0f' : '#fafafa') : (dark ? '#080808' : '#ffffff'),
            color: dark ? '#fff' : '#000', fontSize: 14, transition: 'all 0.2s var(--ease)',
            boxShadow: focused ? (dark ? '0 0 0 3px rgba(255,255,255,0.05)' : '0 0 0 3px rgba(0,0,0,0.06)') : 'none',
          }}
        />
        <button type="button" onClick={onToggle} style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: dark ? '#404040' : '#a3a3a3', display: 'flex', transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = dark ? '#737373' : '#525252'}
          onMouseLeave={e => e.currentTarget.style.color = dark ? '#404040' : '#a3a3a3'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}
