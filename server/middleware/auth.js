const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

module.exports = async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return res.status(401).json({ error: 'Token invalide ou expiré' })
    }

    // Vérifier le statut de l'utilisateur
    const { data: userData } = await supabase
        .from('users')
        .select('status')
        .eq('id', user.id)
        .single()

    if (userData?.status === 'suspended') {
        return res.status(403).json({ error: 'Votre compte a été suspendu' })
    }

    if (userData?.status === 'banned') {
        return res.status(403).json({ error: 'Votre compte a été banni' })
    }

    req.user = user
    next()
}