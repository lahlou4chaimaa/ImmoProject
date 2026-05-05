import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnnoncesPage from './pages/AnnoncesPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function ProtectedRoute({ children, requiredRole = null }) {
    const { user, profile, loading } = useAuth() // ← pas de profileLoading

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
            </div>
        )
    }

    if (!user) return <Navigate to="/auth" replace />

    if (requiredRole === 'admin' && profile?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />

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

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rediriger vers auth si pas connecté */}
                    <Route path="/" element={<Navigate to="/auth" replace />} />

                    {/* Page 404 */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App