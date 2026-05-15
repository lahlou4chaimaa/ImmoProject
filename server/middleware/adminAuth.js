const { createClient } = require('@supabase/supabase-js');

// Initialisation du client Supabase avec la Service Role Key (nécessaire pour getUser)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Email de l'administrateur principal (Super Admin)
const MASTER_ADMIN_EMAIL = 'chayoumlala@proton.me';

module.exports = async function requireAdmin(req, res, next) {
    try {
        // 1. Vérification de la présence du header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Accès refusé : Token manquant' });
        }

        // 2. Extraction et vérification du token via Supabase Auth
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Session invalide ou expirée' });
        }

        // 3. Cas exceptionnel : Autoriser l'admin maître immédiatement par email
        if (user.email === MASTER_ADMIN_EMAIL) {
            req.user = { ...user, role: 'admin' };
            return next();
        }

        // 4. Vérification du rôle et du statut dans la table 'users' pour les autres
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('role, status')
            .eq('id', user.id)
            .single();

        // Si l'utilisateur n'existe pas encore dans la table 'users'
        if (dbError || !userData) {
            return res.status(403).json({ error: 'Profil utilisateur introuvable' });
        }

        // 5. Vérification si le compte est suspendu ou banni
        if (userData.status === 'suspended' || userData.status === 'banned') {
            return res.status(403).json({ error: `Accès refusé : Compte ${userData.status}` });
        }

        // 6. Vérification finale du rôle admin
        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }

        // Succès : On attache les infos utilisateur à la requête pour la suite
        req.user = { ...user, role: userData.role };
        next();

    } catch (err) {
        console.error('Erreur middleware AdminAuth:', err);
        res.status(500).json({ error: 'Erreur interne du serveur lors de l\'authentification' });
    }
};