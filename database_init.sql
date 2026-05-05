-- ============================================
-- CRÉATION INITIALE DE LA BASE DE DONNÉES
-- ============================================

-- 1. CRÉER LA TABLE USERS (profil utilisateur)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR NOT NULL UNIQUE,
    full_name VARCHAR,
    avatar_url TEXT,
    role VARCHAR DEFAULT 'user', -- 'user' ou 'admin'
    status VARCHAR DEFAULT 'active', -- 'active', 'suspended', 'banned'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CRÉER LA TABLE ANNONCES (propriétés immobilières)
CREATE TABLE IF NOT EXISTS annonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(8, 2),
    image_url TEXT,
    status VARCHAR DEFAULT 'active', -- 'active', 'archived'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. AJOUTER DES CONTRAINTES
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD CONSTRAINT check_status CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE annonces ADD CONSTRAINT check_annonce_status CHECK (status IN ('active', 'archived'));

-- 4. CRÉER DES INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_annonces_user_id ON annonces(user_id);
CREATE INDEX IF NOT EXISTS idx_annonces_status ON annonces(status);
CREATE INDEX IF NOT EXISTS idx_annonces_created_at ON annonces(created_at);

-- 5. CRÉER UNE FONCTION POUR METTRE À JOUR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. AJOUTER DES TRIGGERS POUR updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_annonces_updated_at ON annonces;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annonces_updated_at
BEFORE UPDATE ON annonces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. ACTIVER ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;

-- 8. SUPPRIMER LES POLITIQUES EXISTANTES (si elles existent)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view own annonces" ON annonces;
DROP POLICY IF EXISTS "Users can create annonces" ON annonces;
DROP POLICY IF EXISTS "Users can update own annonces" ON annonces;
DROP POLICY IF EXISTS "Users can delete own annonces" ON annonces;
DROP POLICY IF EXISTS "Public can view active annonces" ON annonces;

-- 9. CONFIGURER ROW LEVEL SECURITY POUR USERS

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
USING (auth.uid() = id);

-- Les admins peuvent voir tous les utilisateurs
CREATE POLICY "Admins can view all users" ON users
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- Les utilisateurs peuvent mettre à jour leur propre profil (sauf role/status)
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les admins peuvent mettre à jour tous les utilisateurs
CREATE POLICY "Admins can update all users" ON users
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- Les admins peuvent supprimer des utilisateurs
CREATE POLICY "Admins can delete users" ON users
FOR DELETE
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- 10. CONFIGURER ROW LEVEL SECURITY POUR ANNONCES

-- Les utilisateurs peuvent voir leurs propres annonces
CREATE POLICY "Users can view own annonces" ON annonces
FOR SELECT
USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les annonces
CREATE POLICY "Admins can view all annonces" ON annonces
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- Le public peut voir les annonces actives
CREATE POLICY "Public can view active annonces" ON annonces
FOR SELECT
USING (status = 'active');

-- Les utilisateurs peuvent créer des annonces
CREATE POLICY "Users can create annonces" ON annonces
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres annonces
CREATE POLICY "Users can update own annonces" ON annonces
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres annonces
CREATE POLICY "Users can delete own annonces" ON annonces
FOR DELETE
USING (auth.uid() = user_id);

-- 11. CRÉER UNE TABLE D'AUDIT POUR LES ACTIONS ADMIN
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR NOT NULL, -- 'suspend', 'activate', 'ban', 'delete', 'role_change'
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user_id ON admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- 12. FUNCTION POUR CRÉER UN PROFIL UTILISATEUR AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. TRIGGER POUR CRÉER LE PROFIL À L'INSCRIPTION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONNÉES DE TEST (Optionnel)
-- ============================================

-- Pour ajouter un utilisateur admin de test, vous devez d'abord:
-- 1. L'inscrire via l'interface d'inscription
-- 2. Puis exécuter:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir les tables créées:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Voir les colonnes de users:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- Voir les politiques RLS:
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Voir les utilisateurs:
-- SELECT id, email, full_name, role, status FROM users;
