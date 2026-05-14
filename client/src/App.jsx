import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnnoncesPage from './pages/AnnoncesPage'
import AdminPage from './pages/AdminPage'
import MapPage from './pages/MapPage'
import axios from 'axios'
import './App.css'
import AnnonceDetailPage from './pages/AnnonceDetailPage'

axios.defaults.baseURL = 'http://localhost:3001/api'

function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
    )
}

function UserRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (isAdmin) return <Navigate to="/admin" replace />
    return children
}

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (!isAdmin) return <Navigate to="/dashboard" replace />
    return children
}

// Route accessible par tous les utilisateurs connectés (user ET admin)
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    return children
}

function AuthGuard() {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <Loader />
    if (user) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
    return <AuthPage />
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/auth" element={<AuthGuard />} />
                    <Route path="/dashboard" element={<UserRoute><DashboardPage /></UserRoute>} />
                    <Route path="/annonces" element={<UserRoute><AnnoncesPage /></UserRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

                    {/* Carte accessible par tous les utilisateurs connectés */}
                    <Route path="/carte" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                    <Route path="/annonce/:id" element={<ProtectedRoute><AnnonceDetailPage /></ProtectedRoute>} />

                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App