-- ═════════════════════════════════════════════════════════════════════════════════
-- Script d'initialisation DarNa — Tables Supabase
-- ═════════════════════════════════════════════════════════════════════════════════

-- Table: property_views
-- Description: Historique des consultations de biens — alimente les stats vendeur,
--              le dashboard acheteur (derniers consultés), et les "biens similaires"
CREATE TABLE IF NOT EXISTS property_views (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_property_views_user_id 
    ON property_views(user_id);

CREATE INDEX IF NOT EXISTS idx_property_views_property_id 
    ON property_views(property_id);

CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at 
    ON property_views(viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_views_user_property 
    ON property_views(user_id, viewed_at DESC);

-- RLS: Les utilisateurs voient uniquement leurs propres vues
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs vues" ON property_views
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent insérer leurs vues" ON property_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═════════════════════════════════════════════════════════════════════════════════
-- Notes d'utilisation:
-- ═════════════════════════════════════════════════════════════════════════════════
--
-- 1. Quand un utilisateur consulte un bien (AnnonceDetailPage):
--    INSERT INTO property_views (user_id, property_id) 
--    VALUES (current_user_id, property_id)
--
-- 2. Pour récupérer les biens récemment consultés (DashboardPage):
--    SELECT DISTINCT ON (property_id) id, property_id, viewed_at
--    FROM property_views 
--    WHERE user_id = current_user_id
--    ORDER BY property_id DESC, viewed_at DESC
--    LIMIT 10
--
-- 3. Pour les statistiques vendeur (views par annonce):
--    SELECT COUNT(*) as views 
--    FROM property_views 
--    WHERE property_id = annonce_id
--
