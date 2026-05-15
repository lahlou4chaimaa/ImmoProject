const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAdmin = require('../middleware/adminAuth')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        console.log('✅ requireAdmin passé, user:', req.user?.email)
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
        console.log('SERVICE_KEY existe:', !!process.env.SUPABASE_SERVICE_KEY)

        const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

        console.log('listUsers error:', error)
        console.log('listUsers data keys:', data ? Object.keys(data) : null)

        if (error) throw error

        const users = data.users ?? []

        const formatted = users.map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || '',
            avatar_url: u.user_metadata?.avatar_url || '',
            provider: u.app_metadata?.provider || 'email',
            status: u.user_metadata?.status || 'active',
            role: u.user_metadata?.role || 'user',
            confirmed: !!u.email_confirmed_at,
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
        }))

        res.json(formatted)
    } catch (err) {
        console.error('Erreur GET /admin/users :', err)
        res.status(500).json({ error: err.message })
    }
})

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body

        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' })
        }

        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre statut' })
        }

        const { data, error } = await supabase.auth.admin.updateUserById(req.params.id, {
            user_metadata: { status }
        })

        if (error) throw error

        res.json({ message: `Statut mis à jour : ${status}`, data })
    } catch (err) {
        console.error('Erreur PATCH /status :', err)
        res.status(500).json({ error: err.message })
    }
})

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
    try {
        const { role } = req.body

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' })
        }

        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' })
        }

        const { data, error } = await supabase.auth.admin.updateUserById(req.params.id, {
            user_metadata: { role }
        })

        if (error) throw error

        res.json({ message: `Rôle mis à jour : ${role}`, data })
    } catch (err) {
        console.error('Erreur PATCH /role :', err)
        res.status(500).json({ error: err.message })
    }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
        }

        const { error } = await supabase.auth.admin.deleteUser(req.params.id)

        if (error) throw error

        res.json({ message: 'Utilisateur supprimé avec succès' })
    } catch (err) {
        console.error('Erreur DELETE /users :', err)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router