-- =============================================
-- FIX SCHEMA - Add missing columns and constraints
-- Run this in Supabase SQL Editor
-- =============================================

-- Add description to shops if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'description'
  ) THEN
    ALTER TABLE shops ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add colors to products if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE products ADD COLUMN colors TEXT[];
  END IF;
END $$;

-- Add sizes to products if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sizes'
  ) THEN
    ALTER TABLE products ADD COLUMN sizes TEXT[];
  END IF;
END $$;

-- Add unique constraints for seeding
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shops_name_key'
  ) THEN
    ALTER TABLE shops ADD CONSTRAINT shops_name_key UNIQUE (name);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'games_name_key'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_name_key UNIQUE (name);
  END IF;
END $$;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'shops'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;