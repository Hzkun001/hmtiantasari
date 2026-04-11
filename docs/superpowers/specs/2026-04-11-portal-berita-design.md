# Portal Berita HMTI — Design Spec

**Tanggal:** 2026-04-11
**Status:** Draft

---

## 1. Overview

Membangun portal berita HMTI dengan halaman detail slug-based, rich text editor Tiptap di admin, inline image, dan SEO meta per berita.

---

## 2. Database

**Tabel baru: `News`**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `body` | jsonb | Rich text Tiptap |
| `slug` | text | URL slug, unique, indexed |
| `meta_title` | text | SEO title |
| `meta_description` | text | SEO description |
| `images` | jsonb | Array URL gambar |

**Tabel lama `Activities` tidak diubah.** Fallback tetap jalan.

**Slug auto-generation:** lowercase, hyphen, hapus non-alphanumeric. Duplicate → suffix `-2`, `-3`.

---

## 3. Halaman Publik

### `/berita/page.tsx`
- Card berita klik → `/berita/[slug]`
- Legacy tanpa slug → fallback ke external `link`

### `/berita/[slug]/page.tsx` (BARU)
- Hero image + overlay
- Breadcrumb
- Category badge + title + date + author
- Body rendered dari Tiptap JSON (heading, bold, italic, list, blockquote, image)
- SEO: `<title>`, `<meta description>`, Open Graph
- 404 jika slug tidak ditemukan

---

## 4. Halaman Admin

### `/admin/news/page.tsx`
- Textarea → Tiptap editor
- Field baru: `slug` (auto-generated, editable), `meta_title`, `meta_description`
- Toolbar: Bold, Italic, Strike, H2, H3, List, Blockquote, Image, Link
- Image upload: klik icon atau drag & drop → Supabase Storage
- Auto-extract: plain text → `content`, image URLs → `images`

---

## 5. API

### `GET /api/public/news`
- Response include `slug`, exclude `body`/`meta` (performance)

### `GET /api/public/news/[slug]` (BARU)
- Fetch berita by slug dari tabel `News`
- Return full data: body, meta_title, meta_description, images
- 404 jika tidak ditemukan

---

## 6. Dependencies

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-image @tiptap/extension-link \
  @tiptap/extension-placeholder
npm install -D @tailwindcss/typography
```

---

## 7. Scope

**Included:** Portal slug-based, Tiptap editor, inline image, SEO meta, auto slug, backward compat Activities.

**Excluded:** Real-time update, lightbox, related articles, pagination, draft/publish workflow.

---

## 8. Error Handling

| Scenario | Handling |
|----------|----------|
| Slug not found | 404 page |
| Image upload gagal | Toast error |
| Duplicate slug | Auto suffix `-2` |
| Legacy tanpa slug | Fallback external link |

---

## 9. File Changes

**Modify (5):** `lib/supabase.ts`, `lib/public-data-server.ts`, `app/berita/page.tsx`, `app/admin/news/page.tsx`, `app/api/public/news/route.ts`

**Create (2):** `app/berita/[slug]/page.tsx`, `app/api/public/news/[slug]/route.ts`
