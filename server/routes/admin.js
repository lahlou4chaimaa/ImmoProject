const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAdmin = require('../middleware/adminAuth')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

// GET /api/admin/users — lister tous les utilisateurs
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, status, role, created_at, updated_at')
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/admin/users/:id — obtenir les détails d'un utilisateur
router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single()

        if (error) throw error
        if (!data) return res.status(404).json({ error: 'Utilisateur introuvable' })
        
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PATCH /api/admin/users/:id/status — suspendre/activer un utilisateur
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body

        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' })
        }

        // Vérifier que l'admin ne modifie pas son propre statut
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre statut' })
        }

        const { data, error } = await supabase
            .from('users')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single()

        if (error) throw error
        
        res.json({ 
            message: `Utilisateur ${status === 'suspended' ? 'suspendu' : status === 'banned' ? 'banni' : 'activé'} avec succès`, 
            data 
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PATCH /api/admin/users/:id/role — modifier le rôle d'un utilisateur
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
    try {
        const { role } = req.body

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' })
        }

        // Vérifier que l'admin ne modifie pas son propre rôle
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' })
        }

        const { data, error } = await supabase
            .from('users')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .select()
            .single()

        if (error) throw error
        
        res.json({ 
            message: `Rôle modifié en "${role}" avec succès`, 
            data 
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /api/admin/users/:id — supprimer un utilisateur
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        // Vérifier que l'admin ne supprime pas son propre compte
        if (req.user.id === req.params.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
        }

        // Supprimer d'abord dans la table users
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id)

        if (deleteError) throw deleteError

        // Puis supprimer le compte auth Supabase
        const { error: authError } = await supabase.auth.admin.deleteUser(req.params.id)
        
        if (authError) throw authError

        res.json({ message: 'Utilisateur supprimé avec succès' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
