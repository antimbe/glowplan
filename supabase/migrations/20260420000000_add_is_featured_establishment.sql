-- Ajoute le flag "partenaire phare" sur les établissements
-- Seule l'équipe GlowPlan peut le modifier (via le dashboard Supabase ou un futur back-office)

ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Index pour les requêtes de la page d'accueil
CREATE INDEX IF NOT EXISTS idx_establishments_featured
  ON establishments (is_featured)
  WHERE is_featured = TRUE;

-- Commentaire
COMMENT ON COLUMN establishments.is_featured IS
  'Mis à true par l''équipe GlowPlan pour afficher l''établissement dans la section "Nos partenaires phares" de la page d''accueil.';
