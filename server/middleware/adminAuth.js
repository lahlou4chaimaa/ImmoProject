const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return res.status(401).json({ error: 'Token invalide' })
    }

    // Vérifier que l'utilisateur est admin dans la table users
    const { data: userData } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', user.id)
        .single()

    if (userData?.status === 'suspended' || userData?.status === 'banned') {
        return res.status(403).json({ error: 'Compte bloqué' })
    }

    if (userData?.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
    }

    req.user = { ...user, role: userData.role }
    next()
}