import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnnoncesPage from './pages/AnnoncesPage'

// Composant de protection de route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Chargement...
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Route publique */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Routes protégées */}
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

          {/* Redirection par défaut (si l'utilisateur est connecté, tu pourrais rediriger vers /dashboard) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App