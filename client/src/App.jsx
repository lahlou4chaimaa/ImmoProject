import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnnoncesPage from './pages/AnnoncesPage'
import Tutorial from './components/Tutorial'


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem("seenTutorial")
      if (!seen) {
        setShowTutorial(true)
      }
    }
  }, [user])

  const handleFinish = () => {
    localStorage.setItem("seenTutorial", "true")
    setShowTutorial(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Chargement...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <>
      {showTutorial && <Tutorial onFinish={handleFinish} />}
      {children}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/annonces"
            element={
              <ProtectedRoute>
                <AnnoncesPage />
              </ProtectedRoute>
            }
          />

          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App