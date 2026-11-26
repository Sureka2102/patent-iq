import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28, borderWidth: 3 }} />
        <div style={{ fontSize: 13, color: '#a3a3a3' }}>Loading...</div>
      </div>
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}
