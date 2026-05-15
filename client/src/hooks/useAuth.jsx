import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import axios from 'axios'

const AuthContext = createContext(null)

const ADMIN_EMAIL = 'chayoumlala@proton.me'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const isAdmin = user?.email === ADMIN_EMAIL
    const isSeller = !isAdmin && user?.user_metadata?.role === 'vendeur'
    const isBuyer = !isAdmin && !isSeller

    // ─── Intercepteur axios : attache automatiquement le token ───────────────
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(async (config) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`
            }
            return config
        })
        return () => axios.interceptors.request.eject(interceptor)
    }, [])

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => { mounted = false; subscription.unsubscribe() }
    }, [])

    // ─── signUp accepte maintenant un rôle ──────────────────────────────────
    const signUp = async (email, password, fullName, role = 'acheteur') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role, // 'acheteur' ou 'vendeur'
                }
            }
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth` }
        })
        if (error) throw error
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setLoading(false)
    }

    // ─── Appels admin ────────────────────────────────────────────────────────
    const getAllUsers = async () => (await axios.get('/api/admin/users')).data
    const suspendUser = async (id) => (await axios.patch(`/api/admin/users/${id}/status`, { status: 'suspended' })).data
    const activateUser = async (id) => (await axios.patch(`/api/admin/users/${id}/status`, { status: 'active' })).data
    const banUser = async (id) => (await axios.patch(`/api/admin/users/${id}/status`, { status: 'banned' })).data
    const updateUserRole = async (id, role) => (await axios.patch(`/api/admin/users/${id}/role`, { role })).data
    const deleteUser = async (id) => (await axios.delete(`/api/admin/users/${id}`)).data

    return (
        <AuthContext.Provider value={{
            user, loading,
            isAdmin, isSeller, isBuyer,
            signUp, signIn, signInWithGoogle, signOut,
            getAllUsers, suspendUser, activateUser,
            banUser, updateUserRole, deleteUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)