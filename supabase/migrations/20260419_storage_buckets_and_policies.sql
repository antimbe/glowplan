-- ============================================================================
-- CRÉATION DES BUCKETS STORAGE ET LEURS POLITIQUES RLS
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. BUCKETS
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'establishment-photos',
    'establishment-photos',
    true,
    10485760,   -- 10 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
  )
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'service-images',
    'service-images',
    true,
    10485760,   -- 10 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
  )
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. POLITIQUES RLS — establishment-photos
-- ──────────────────────────────────────────────────────────────────────────────

-- Lecture publique (n'importe qui peut lire les photos)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'establishment-photos: public read'
  ) THEN
    CREATE POLICY "establishment-photos: public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'establishment-photos');
  END IF;
END $$;

-- Upload : l'utilisateur authentifié peut uploader dans son propre dossier (1er segment = son UID)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'establishment-photos: owner insert'
  ) THEN
    CREATE POLICY "establishment-photos: owner insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'establishment-photos'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Mise à jour (upsert) : le propriétaire peut écraser ses fichiers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'establishment-photos: owner update'
  ) THEN
    CREATE POLICY "establishment-photos: owner update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'establishment-photos'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Suppression : le propriétaire peut supprimer ses fichiers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'establishment-photos: owner delete'
  ) THEN
    CREATE POLICY "establishment-photos: owner delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'establishment-photos'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. POLITIQUES RLS — service-images
-- ──────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'service-images: public read'
  ) THEN
    CREATE POLICY "service-images: public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'service-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'service-images: owner insert'
  ) THEN
    CREATE POLICY "service-images: owner insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'service-images'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'service-images: owner update'
  ) THEN
    CREATE POLICY "service-images: owner update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'service-images'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'service-images: owner delete'
  ) THEN
    CREATE POLICY "service-images: owner delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'service-images'
      AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
