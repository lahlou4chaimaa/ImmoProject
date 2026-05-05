import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import axios from 'axios'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(true)

    const loadProfile = async (userId) => {
        setProfileLoading(true)
        try {
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()
            setProfile(data)
        } catch (error) {
            console.error('Erreur chargement profil:', error)
            setProfile(null)
        } finally {
            setProfileLoading(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                loadProfile(session.user.id)
            } else {
                setLoading(false)
                setProfileLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    loadProfile(session.user.id)
                } else {
                    setProfile(null)
                    setProfileLoading(false)
                    setLoading(false)
                }
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/dashboard` }
        })
        if (error) throw error
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
        setProfileLoading(false)
        setLoading(false)
    }

    const getAuthHeader = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return {
            headers: { Authorization: `Bearer ${session?.access_token}` }
        }
    }

    const getAllUsers = async () => {
        const config = await getAuthHeader()
        const { data } = await axios.get(`${API_URL}/admin/users`, config)
        return data
    }

    const getUserById = async (userId) => {
        const config = await getAuthHeader()
        const { data } = await axios.get(`${API_URL}/admin/users/${userId}`, config)
        return data
    }

    const suspendUser = async (userId) => {
        const config = await getAuthHeader()
        const { data } = await axios.patch(
            `${API_URL}/admin/users/${userId}/status`,
            { status: 'suspended' },
            config
        )
        return data
    }

    const activateUser = async (userId) => {
        const config = await getAuthHeader()
        const { data } = await axios.patch(
            `${API_URL}/admin/users/${userId}/status`,
            { status: 'active' },
            config
        )
        return data
    }

    const banUser = async (userId) => {
        const config = await getAuthHeader()
        const { data } = await axios.patch(
            `${API_URL}/admin/users/${userId}/status`,
            { status: 'banned' },
            config
        )
        return data
    }

    const updateUserRole = async (userId, role) => {
        const config = await getAuthHeader()
        const { data } = await axios.patch(
            `${API_URL}/admin/users/${userId}/role`,
            { role },
            config
        )
        return data
    }

    const deleteUser = async (userId) => {
        const config = await getAuthHeader()
        const { data } = await axios.delete(
            `${API_URL}/admin/users/${userId}`,
            config
        )
        return data
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            profileLoading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut,
            getAllUsers,
            getUserById,
            suspendUser,
            activateUser,
            banUser,
            updateUserRole,
            deleteUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)