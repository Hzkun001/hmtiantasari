-- Create TeamMembers table
CREATE TABLE IF NOT EXISTS public."TeamMembers" (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    bio TEXT,
    image_url TEXT,
    linkedin TEXT,
    instagram TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create SiteSettings table
CREATE TABLE IF NOT EXISTS public."SiteSettings" (
    id BIGSERIAL PRIMARY KEY,
    site_name TEXT NOT NULL DEFAULT 'HMTI UNAIR',
    site_tagline TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    about_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."TeamMembers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSettings" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON public."TeamMembers"
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public."SiteSettings"
    FOR SELECT USING (true);

-- Create policies for authenticated write access (admin only)
CREATE POLICY "Enable insert for authenticated users only" ON public."TeamMembers"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public."TeamMembers"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public."TeamMembers"
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public."SiteSettings"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public."SiteSettings"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public."SiteSettings"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO public."SiteSettings" (site_name, site_tagline, about_text)
VALUES (
    'HMTI UNAIR',
    'Himpunan Mahasiswa Teknik Informatika Universitas Airlangga',
    'HMTI UNAIR adalah organisasi mahasiswa yang bergerak di bidang teknologi informasi dan pengembangan soft skills.'
)
ON CONFLICT DO NOTHING;

-- ========================================
-- STORAGE BUCKET POLICIES
-- ========================================

-- Policy untuk bucket team-images
-- Require authentication for uploads

-- Allow public read access
CREATE POLICY "Public read access for team-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload team-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update team-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete team-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');

-- Policy untuk bucket project-images
-- Allow public read access
CREATE POLICY "Public read access for project-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload project-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update project-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete project-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- ========================================
-- ALTER TABLE - Add link column to Activities
-- ========================================

-- Add link column to Activities table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Activities'
        AND column_name = 'link'
    ) THEN
        ALTER TABLE public."Activities" ADD COLUMN link TEXT;
    END IF;
END $$;

-- ========================================
-- CERTIFICATES - Certificate Checker
-- ========================================

-- Catatan:
-- Halaman certificate checker memvalidasi lewat dua langkah:
-- 1) kode harus terdaftar di table public."Certificates"
-- 2) file PDF untuk kode tersebut harus ada di storage bucket certificates

-- Table untuk menyimpan data sertifikat publik (tanpa data sensitif)
CREATE TABLE IF NOT EXISTS public."Certificates" (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    issued_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalisasi schema untuk project yang sudah terlanjur pakai struktur lama
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'Certificates'
    ) THEN
        ALTER TABLE public."Certificates"
            ADD COLUMN IF NOT EXISTS code TEXT,
            ADD COLUMN IF NOT EXISTS issued_at DATE,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

        ALTER TABLE public."Certificates" DROP COLUMN IF EXISTS recipient_name;
        ALTER TABLE public."Certificates" DROP COLUMN IF EXISTS certificate_title;
        ALTER TABLE public."Certificates" DROP COLUMN IF EXISTS activity_title;
        ALTER TABLE public."Certificates" DROP COLUMN IF EXISTS image_url;
        ALTER TABLE public."Certificates" DROP COLUMN IF EXISTS pdf_url;

        ALTER TABLE public."Certificates" ALTER COLUMN created_at SET DEFAULT NOW();

        IF NOT EXISTS (SELECT 1 FROM public."Certificates" WHERE code IS NULL) THEN
            ALTER TABLE public."Certificates" ALTER COLUMN code SET NOT NULL;
        END IF;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "Certificates_code_unique_idx" ON public."Certificates" (code);

ALTER TABLE public."Certificates" ENABLE ROW LEVEL SECURITY;

-- Public read access (dipakai oleh halaman certificate checker)
CREATE POLICY "Public read access for certificates" ON public."Certificates"
    FOR SELECT USING (true);

-- Write access hanya untuk user authenticated (admin)
CREATE POLICY "Authenticated users can insert certificates" ON public."Certificates"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update certificates" ON public."Certificates"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete certificates" ON public."Certificates"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Storage bucket policies untuk asset sertifikat (image/pdf)
-- Bucket: 'certificates' (public) untuk akses langsung dari halaman publik.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'certificates',
    'certificates',
    true,
    52428800,
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Idempotent policies: drop jika sudah ada lalu buat ulang
DROP POLICY IF EXISTS "Public read access for certificates bucket" ON storage.objects;
CREATE POLICY "Public read access for certificates bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Authenticated users can upload certificates bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload certificates bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update certificates bucket" ON storage.objects;
CREATE POLICY "Authenticated users can update certificates bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete certificates bucket" ON storage.objects;
CREATE POLICY "Authenticated users can delete certificates bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

-- ========================================
-- CERTIFICATES TEST SEED (opsional)
-- ========================================
-- Jalankan section ini untuk test cepat certificate-checker.
-- Setelah insert, upload file PDF ke bucket `certificates` dengan salah satu pola:
-- 1) <CODE>/certificate.pdf
-- 2) <CODE>/sertifikat.pdf
-- 3) <CODE>.pdf
-- Contoh path yang direkomendasikan:
-- - HMTI-2025-0001/certificate.pdf
-- - HMTI-2025-0002/certificate.pdf
-- - HMTI-2025-0003/certificate.pdf

INSERT INTO public."Certificates" (code, issued_at)
VALUES
    ('HMTI-2025-0001', DATE '2025-08-17'),
    ('HMTI-2025-0002', DATE '2025-09-01'),
    ('HMTI-2025-0003', DATE '2025-10-21')
ON CONFLICT (code) DO UPDATE
SET issued_at = EXCLUDED.issued_at;
