-- Migration: 20260927_add_postgis_location
-- Ajoute le support PostGIS sur la table Salon pour les requêtes géospatiales
-- (ST_DWithin, ST_Distance) avec index GiST natif PostgreSQL.
--
-- Stratégie :
--   - On garde latitude/longitude (Float) pour Prisma ORM
--   - On ajoute location geometry(Point, 4326) maintenu par trigger SQL
--   - Prisma ne lit/écrit jamais location directement

-- ============================================================
-- 1. Activer l'extension PostGIS (idempotent)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 2. Ajouter la colonne geometry sur Salon
-- ============================================================
ALTER TABLE "Salon"
  ADD COLUMN IF NOT EXISTS "location" geometry(Point, 4326);

-- ============================================================
-- 3. Peupler location à partir des données lat/lng existantes
-- ============================================================
UPDATE "Salon"
SET "location" = ST_SetSRID(
  ST_MakePoint("longitude", "latitude"),
  4326
)
WHERE "latitude" IS NOT NULL
  AND "longitude" IS NOT NULL;

-- ============================================================
-- 4. Créer l'index GiST spatial (requis pour ST_DWithin rapide)
-- ============================================================
CREATE INDEX IF NOT EXISTS "Salon_location_gist_idx"
  ON "Salon" USING GIST ("location");

-- ============================================================
-- 5. Fonction trigger : sync lat/lng → location automatiquement
-- ============================================================
CREATE OR REPLACE FUNCTION sync_salon_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
    NEW."location" = ST_SetSRID(
      ST_MakePoint(NEW."longitude", NEW."latitude"),
      4326
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. Attacher le trigger BEFORE INSERT OR UPDATE sur Salon
-- ============================================================
DROP TRIGGER IF EXISTS "trg_salon_sync_location" ON "Salon";

CREATE TRIGGER "trg_salon_sync_location"
BEFORE INSERT OR UPDATE OF "latitude", "longitude"
ON "Salon"
FOR EACH ROW
EXECUTE FUNCTION sync_salon_location();
