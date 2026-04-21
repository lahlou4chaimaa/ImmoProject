const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')
const requireAuth = require('../middleware/auth')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

// GET /api/auth/me — profil utilisateur connecté
router.get('/me', requireAuth, async (req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single()

    if (error) return res.status(404).json({ error: 'Profil introuvable' })
    res.json(data)
})

// PATCH /api/auth/profile — mise à jour profil
router.patch('/profile', requireAuth, async (req, res) => {
    const { full_name, avatar_url } = req.body
    const { data, error } = await supabase
        .from('users')
        .update({ full_name, avatar_url, updated_at: new Date().toISOString() })
        .eq('id', req.user.id)
        .select()
        .single()

    if (error) return res.status(400).json({ error: error.message })
    res.json(data)
})

module.exports = router