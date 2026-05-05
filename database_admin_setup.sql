-- ============================================
-- GESTION ADMINISTRATIVE DES UTILISATEURS
-- ============================================
-- ⚠️  IMPORTANT: Exécutez d'abord database_init.sql
-- pour créer les tables et configurer la base de données

-- 1. Vérifier que les colonnes role et status existent
-- (Elles sont créées par database_init.sql)

-- 2. Promouvoir un utilisateur en administrateur
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 3. Voir tous les utilisateurs avec leurs rôles et statuts
-- SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC;

-- 4. Suspendre un utilisateur
-- UPDATE users SET status = 'suspended', updated_at = NOW() WHERE email = 'user@example.com';

-- 5. Activer un utilisateur
-- UPDATE users SET status = 'active', updated_at = NOW() WHERE email = 'user@example.com';

-- 6. Bannir un utilisateur
-- UPDATE users SET status = 'banned', updated_at = NOW() WHERE email = 'user@example.com';

-- 7. Voir les administrateurs
-- SELECT id, email, full_name FROM users WHERE role = 'admin';

-- 8. Voir les utilisateurs suspendus
-- SELECT id, email, full_name, status FROM users WHERE status = 'suspended';

-- 9. Voir les utilisateurs bannis
-- SELECT id, email, full_name, status FROM users WHERE status = 'banned';

-- 10. Voir les logs d'audit
-- SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50;

-- ============================================
-- FUNCTION POUR ENREGISTRER LES ACTIONS ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action VARCHAR,
    p_target_user_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO admin_audit_logs (admin_id, action, target_user_id, details)
    VALUES (p_admin_id, p_action, p_target_user_id, p_details);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EXAMPLE: APPELER LA FONCTION
-- ============================================

-- SELECT log_admin_action(
--     (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
--     'suspend',
--     (SELECT id FROM users WHERE email = 'user@example.com'),
--     jsonb_build_object('reason', 'Violation des conditions')
-- );
