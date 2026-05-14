import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import axios from 'axios'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnnoncesPage from './pages/AnnoncesPage'
import AdminPage from './pages/AdminPage'
import MapPage from './pages/MapPage'
import AnnonceDetailPage from './pages/AnnonceDetailPage'
import Tutorial from './components/Tutorial'
import './App.css'

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
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {
        if (user && !isAdmin) {
            const seen = localStorage.getItem("seenTutorial")
            if (!seen) setShowTutorial(true)
        }
    }, [user, isAdmin])

    const handleFinish = () => {
        localStorage.setItem("seenTutorial", "true")
        setShowTutorial(false)
    }

    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (isAdmin) return <Navigate to="/admin" replace />

    return (
        <>
            {showTutorial && <Tutorial onFinish={handleFinish} />}
            {children}
        </>
    )
}

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (!isAdmin) return <Navigate to="/dashboard" replace />
    return children
}

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
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/auth" element={<AuthGuard />} />

                    {/* Routes Utilisateurs */}
                    <Route path="/dashboard" element={<UserRoute><DashboardPage /></UserRoute>} />
                    <Route path="/annonces" element={<UserRoute><AnnoncesPage /></UserRoute>} />

                    {/* Route Admin */}
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

                    {/* Routes accessibles par tous les utilisateurs connectés */}
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