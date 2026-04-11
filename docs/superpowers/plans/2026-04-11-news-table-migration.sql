-- ============================================================
-- Portal Berita HMTI — Database Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tambah kolom baru ke tabel News
ALTER TABLE "News"
  ADD COLUMN IF NOT EXISTS "body" jsonb DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  ADD COLUMN IF NOT EXISTS "slug" text,
  ADD COLUMN IF NOT EXISTS "meta_title" text,
  ADD COLUMN IF NOT EXISTS "meta_description" text,
  ADD COLUMN IF NOT EXISTS "images" jsonb DEFAULT '[]'::jsonb;

-- 2. Buat index untuk slug (supaya fetch by slug cepat)
CREATE INDEX IF NOT EXISTS "News_slug_idx" ON "News"("slug");

-- 3. Buat slug otomatis dari title untuk data yang sudah ada
UPDATE "News"
SET "slug" = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
    )
)
WHERE "slug" IS NULL AND title IS NOT NULL;

-- 4. Enable RLS (Row Level Security) untuk keamanan
ALTER TABLE "News" ENABLE ROW LEVEL SECURITY;

-- 5. Policy: semua orang bisa baca berita
CREATE POLICY "Public read access" ON "News"
  FOR SELECT USING (true);

-- 6. Policy: admin bisa insert/update/delete
-- (asumsikan sudah ada auth.users, adjust sesuai kebutuhan)
-- CREATE POLICY "Admin full access" ON "News"
--   FOR ALL USING (auth.role() = 'authenticated');
