import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FileSearch, LayoutDashboard, FolderOpen, Database, LogOut, ChevronDown, Sun, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { setDropOpen(false); logout(); navigate('/login') }

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects',  label: 'Projects',  icon: FolderOpen },
    { to: '/patents',   label: 'Patent Library', icon: Database },
  ]

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid var(--nav-border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, background: 'var(--text)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <FileSearch size={15} color="var(--bg)" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em', color: 'var(--text)' }}>
            Patent<span style={{ color: 'var(--text3)' }}>IQ</span>
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  color: active ? 'var(--text)' : 'var(--text2)',
                  background: active ? 'var(--active-bg)' : 'transparent',
                  transition: 'all 0.15s var(--ease)',
                  boxShadow: active ? 'inset 0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--hover-bg)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent' } }}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Right side: theme toggle + user dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={{
            width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', transition: 'all 0.15s',
            color: 'var(--text2)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text2)' }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User dropdown */}
          {user && (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button onClick={() => setDropOpen(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px 5px 6px', borderRadius: 9,
                border: `1px solid ${dropOpen ? 'var(--border2)' : 'var(--border)'}`,
                background: dropOpen ? 'var(--bg2)' : 'var(--bg)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg2)' }}
                onMouseLeave={e => { if (!dropOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' } }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: 'var(--bg)', flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <ChevronDown size={12} color="var(--text3)" style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>

              {dropOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--drop-bg)', border: '1px solid var(--border)', borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
                  minWidth: 210, padding: 6,
                  animation: 'scaleIn 0.15s var(--ease)',
                  transformOrigin: 'top right',
                }}>
                  <div style={{ padding: '10px 13px 13px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
                  </div>
                  <button onClick={handleLogout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 13px', borderRadius: 9, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: 'var(--text2)',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' }}
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
