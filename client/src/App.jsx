import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'



function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>
  return user ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/auth" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App