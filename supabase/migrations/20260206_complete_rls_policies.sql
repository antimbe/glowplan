-- ============================================================================
-- POLITIQUES RLS ADDITIONNELLES POUR GLOWPLAN
-- ============================================================================
-- Ce fichier AJOUTE des politiques RLS sans supprimer les existantes.
-- Utilisez "CREATE POLICY IF NOT EXISTS" ou vérifiez manuellement les doublons.
-- Exécutez ce script dans le SQL Editor de Supabase.
-- ============================================================================

-- ============================================================================
-- TABLE: appointments - POLITIQUES MANQUANTES
-- ============================================================================
-- Permettre aux clients de modifier leurs propres RDV (pour annulation)

DO $$ 
BEGIN
  -- Politique pour que les clients puissent UPDATE leurs RDV
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Clients can update their own appointments'
  ) THEN
    CREATE POLICY "Clients can update their own appointments" ON appointments
    FOR UPDATE USING (
      client_profile_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Politique pour que les clients puissent SELECT leurs RDV
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' 
    AND policyname = 'Clients can view their own appointments'
  ) THEN
    CREATE POLICY "Clients can view their own appointments" ON appointments
    FOR SELECT USING (
      client_profile_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- ============================================================================
-- TABLE: client_profiles - POLITIQUES MANQUANTES
-- ============================================================================

DO $$ 
BEGIN
  -- Les clients peuvent voir leur propre profil
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Users can view their own client profile'
  ) THEN
    CREATE POLICY "Users can view their own client profile" ON client_profiles
    FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Les clients peuvent créer leur profil
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Users can insert their own client profile'
  ) THEN
    CREATE POLICY "Users can insert their own client profile" ON client_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Les clients peuvent modifier leur profil
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Users can update their own client profile'
  ) THEN
    CREATE POLICY "Users can update their own client profile" ON client_profiles
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- TABLE: favorites - POLITIQUES MANQUANTES
-- ============================================================================

DO $$ 
BEGIN
  -- Les clients peuvent voir leurs favoris
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' 
    AND policyname = 'Users can view their own favorites'
  ) THEN
    CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (
      client_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Les clients peuvent ajouter des favoris
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' 
    AND policyname = 'Users can insert their own favorites'
  ) THEN
    CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (
      client_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Les clients peuvent supprimer leurs favoris
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' 
    AND policyname = 'Users can delete their own favorites'
  ) THEN
    CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (
      client_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Les propriétaires peuvent voir les favoris de leur établissement
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' 
    AND policyname = 'Establishment owners can count favorites'
  ) THEN
    CREATE POLICY "Establishment owners can count favorites" ON favorites
    FOR SELECT USING (
      establishment_id IN (
        SELECT id FROM establishments WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- ============================================================================
-- TABLE: reviews - POLITIQUES MANQUANTES
-- ============================================================================

DO $$ 
BEGIN
  -- Les clients peuvent créer des avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' 
    AND policyname = 'Clients can insert their own reviews'
  ) THEN
    CREATE POLICY "Clients can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (
      client_profile_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Les clients peuvent supprimer leurs avis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reviews' 
    AND policyname = 'Clients can delete their own reviews'
  ) THEN
    CREATE POLICY "Clients can delete their own reviews" ON reviews
    FOR DELETE USING (
      client_profile_id IN (
        SELECT id FROM client_profiles WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- ============================================================================
-- VÉRIFICATION: Activer RLS sur toutes les tables si pas déjà fait
-- ============================================================================

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
