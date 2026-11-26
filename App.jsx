import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Report from './pages/Report'
import PatentLibrary from './pages/PatentLibrary'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
      <Route path="/patents" element={<ProtectedRoute><Layout><PatentLibrary /></Layout></ProtectedRoute>} />
      <Route path="/report/:id" element={<ProtectedRoute><Layout><Report /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #262626',
              padding: '10px 16px',
            },
            success: { iconTheme: { primary: '#fff', secondary: '#000' } },
            error: { style: { background: '#1a0000', border: '1px solid #3d0000', color: '#fff' } },
          }}
        />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
