import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, clearAuthTokens } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me()
        .then(r => setUser(r.data))
        .catch(() => {
          clearAuthTokens()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    localStorage.setItem('access_token', r.data.access_token)
    localStorage.setItem('refresh_token', r.data.refresh_token)
    const me = await authAPI.me()
    setUser(me.data)
  }

  const register = async (name, email, password) => {
    await authAPI.register({ name, email, password })
  }

  const logout = () => {
    clearAuthTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
