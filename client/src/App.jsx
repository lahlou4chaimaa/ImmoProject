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
import SellerPage from './pages/Sellerpage'
import Tutorial from './components/Tutorial'
import './App.css'
import StudioPage from './pages/StudioPage'

axios.defaults.baseURL = 'http://localhost:3001'

function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
    )
}

// ─── Route acheteur uniquement ───────────────────────────────────────────────
function BuyerRoute({ children }) {
    const { user, isAdmin, isSeller, loading } = useAuth()
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {
        if (user && !isAdmin && !isSeller) {
            const seen = localStorage.getItem('seenTutorial')
            if (!seen) setShowTutorial(true)
        }
    }, [user, isAdmin, isSeller])

    const handleFinish = () => {
        localStorage.setItem('seenTutorial', 'true')
        setShowTutorial(false)
    }

    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (isAdmin) return <Navigate to="/admin" replace />
    if (isSeller) return <Navigate to="/seller" replace />

    return (
        <>
            {showTutorial && <Tutorial onFinish={handleFinish} />}
            {children}
        </>
    )
}

// ─── Route vendeur uniquement ────────────────────────────────────────────────
function SellerRoute({ children }) {
    const { user, isAdmin, isSeller, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (isAdmin) return <Navigate to="/admin" replace />
    if (!isSeller) return <Navigate to="/dashboard" replace />
    return children
}

// ─── Route admin uniquement ──────────────────────────────────────────────────
function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    if (!isAdmin) return <Navigate to="/dashboard" replace />
    return children
}

// ─── Route tout utilisateur connecté ────────────────────────────────────────
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <Loader />
    if (!user) return <Navigate to="/auth" replace />
    return children
}

// ─── Guard page auth : redirige si déjà connecté ────────────────────────────
function AuthGuard() {
    const { user, isAdmin, isSeller, loading } = useAuth()
    if (loading) return <Loader />
    if (user) {
        if (isAdmin) return <Navigate to="/admin" replace />
        if (isSeller) return <Navigate to="/seller" replace />
        return <Navigate to="/dashboard" replace />
    }
    return <AuthPage />
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/auth" element={<AuthGuard />} />

                    {/* Acheteur */}
                    <Route path="/dashboard" element={<BuyerRoute><DashboardPage /></BuyerRoute>} />
                    <Route path="/annonces" element={<BuyerRoute><AnnoncesPage /></BuyerRoute>} />

                    {/* Vendeur */}
                    <Route path="/seller" element={<SellerRoute><SellerPage /></SellerRoute>} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

                    {/* Commun (tous connectés) */}
                    <Route path="/carte" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                    <Route path="/annonce/:id" element={<ProtectedRoute><AnnonceDetailPage /></ProtectedRoute>} />
                    <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />

                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App