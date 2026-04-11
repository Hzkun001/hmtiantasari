# Portal Berita HMTI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Portal berita HMTI dengan halaman detail slug-based, Tiptap editor di admin, inline image, dan SEO meta.

**Architecture:** Tabel `News` yang sudah ada ditambah 5 kolom baru (body, slug, meta_title, meta_description, images). Tidak ada tabel baru, tidak ada data lama dihapus.

**Tech Stack:** Next.js, Supabase, Tailwind CSS, Tiptap, Cloudinary

---

## Database Migration (Jalankan duluan)

```sql
-- Jalankan di Supabase Dashboard → SQL Editor
ALTER TABLE "News"
  ADD COLUMN IF NOT EXISTS "body" jsonb DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  ADD COLUMN IF NOT EXISTS "slug" text UNIQUE,
  ADD COLUMN IF NOT EXISTS "meta_title" text,
  ADD COLUMN IF NOT EXISTS "meta_description" text,
  ADD COLUMN IF NOT EXISTS "images" jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS "News_slug_idx" ON "News"("slug");
```

---

## Task 1: Update Type `NewsItem` di `lib/supabase.ts`

**Files:** Modify: `lib/supabase.ts`

- [ ] **Step 1: Tambahkan type `NewsItem` baru**

Tambah setelah interface `Activity`:

```typescript
export interface NewsItem {
    id: number;
    title: string;
    content: string;
    body: Record<string, unknown> | null;
    image_url: string | null;
    date: string;
    category?: string;
    author?: string;
    link?: string;
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    images?: string[];
    created_at?: string;
    updated_at?: string;
}
```

---

## Task 2: Update API `GET /api/public/news`

**Files:** Modify: `app/api/public/news/route.ts`

- [ ] **Step 1: Update NEWS_SELECT constant**

Tambah kolom slug ke select:

```typescript
const NEWS_SELECT = 'id,title,content,image_url,date,category,author,link,slug';
```

---

## Task 3: Buat API `GET /api/public/news/[slug]`

**Files:** Create: `app/api/public/news/[slug]/route.ts`

- [ ] **Step 1: Buat file dengan logic fetch by slug**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const NEWS_SELECT = 'id,title,content,body,image_url,date,category,author,slug,meta_title,meta_description,images,created_at';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const url = new URL('/rest/v1/News', supabaseUrl);
    url.searchParams.set('select', NEWS_SELECT);
    url.searchParams.set('slug', `eq.${slug}`);
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString(), {
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json({ data: data[0] });
}
```

---

## Task 4: Update `lib/public-data-server.ts`

**Files:** Modify: `lib/public-data-server.ts`

- [ ] **Step 1: Update NEWS_SELECT**

```typescript
const NEWS_SELECT = 'id,title,content,image_url,date,category,author,link,slug';
```

- [ ] **Step 2: Tambah function `fetchPublicNewsBySlug`**

```typescript
export async function fetchPublicNewsBySlug(slug: string): Promise<NewsItem | null> {
    const config = getSupabasePublicConfig();
    if (!config) return null;

    const { supabaseUrl, supabaseAnonKey } = config;

    const url = new URL('/rest/v1/News', supabaseUrl);
    url.searchParams.set('select', 'id,title,content,body,image_url,date,category,author,slug,meta_title,meta_description,images,created_at');
    url.searchParams.set('slug', `eq.${slug}`);
    url.searchParams.set('limit', '1');

    try {
        const response = await fetch(url.toString(), {
            headers: createRestHeaders(supabaseAnonKey),
            next: { revalidate: 300 },
        });

        if (!response.ok) return null;

        const rows = await response.json();
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    } catch {
        return null;
    }
}
```

---

## Task 5: Install Dependencies Tiptap

**Files:** None (npm install)

- [ ] **Step 1: Install Tiptap packages**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
npm install -D @tailwindcss/typography
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Tiptap dependencies for rich text editor"
```

---

## Task 6: Buat Halaman Detail `/berita/[slug]/page.tsx`

**Files:** Create: `app/berita/[slug]/page.tsx`

- [ ] **Step 1: Buat komponen halaman detail berita**

```tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchPublicNewsBySlug } from '@/lib/public-data-server';
import { getCloudinaryFetchImageUrl } from '@/lib/cloudinary';
import { generateTiptapRenderer } from '@/components/tiptap/renderer';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const news = await fetchPublicNewsBySlug(params.slug);
    if (!news) return {};

    return {
        title: news.meta_title ?? `${news.title} - HMTI`,
        description: news.meta_description ?? news.content,
        openGraph: {
            images: news.image_url ? [news.image_url] : [],
        },
    };
}

export default async function BeritaDetailPage({ params }: { params: { slug: string } }) {
    const news = await fetchPublicNewsBySlug(params.slug);

    if (!news) {
        notFound();
    }

    const optimizedImage = getCloudinaryFetchImageUrl(news.image_url, {
        width: 1600,
        height: 900,
        crop: 'fill',
        gravity: 'auto',
    });

    const formattedDate = new Date(news.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />

            {/* Hero Image */}
            <div className="relative h-[50vh] min-h-[400px]">
                {optimizedImage ? (
                    <Image
                        src={optimizedImage}
                        alt={news.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-neutral-700 via-neutral-800 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,213,108,0.2),transparent_50%)]" />
            </div>

            {/* Content */}
            <div className="container py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="mb-6 text-sm text-neutral-400">
                        <a href="/berita" className="hover:text-white transition">Berita</a>
                        <span className="mx-2">/</span>
                        <span className="text-white">{news.title}</span>
                    </nav>

                    {/* Category Badge */}
                    {news.category && (
                        <span className="inline-block rounded-full border border-white/20 bg-black/40 px-4 py-1 text-sm text-neutral-100 mb-4">
                            {news.category}
                        </span>
                    )}

                    {/* Title */}
                    <h1
                        className="text-4xl md:text-5xl text-white mb-4"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        {news.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-neutral-300 text-sm mb-8">
                        <time>{formattedDate}</time>
                        {news.author && (
                            <>
                                <span>•</span>
                                <span>Oleh {news.author}</span>
                            </>
                        )}
                    </div>

                    <hr className="border-white/10 mb-8" />

                    {/* Body */}
                    {news.body && (
                        <div className="prose prose-invert prose-lg max-w-none">
                            {/* Render Tiptap JSON — placeholder, actual implementation di Task 7 */}
                            <p className="text-neutral-300">{news.content}</p>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="mt-12">
                        <a
                            href="/berita"
                            className="inline-flex items-center gap-2 text-[#FFD56C] hover:underline"
                        >
                            ← Kembali ke Berita
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
```

- [ ] **Step 2: Buat 404 page**

Create: `app/berita/[slug]/not-found.tsx`

```tsx
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />
            <div className="container pt-40 pb-20 text-center">
                <h1 className="text-6xl font-bold text-[#FFD56C]">404</h1>
                <p className="mt-4 text-xl text-neutral-300">Berita tidak ditemukan.</p>
                <Link href="/berita" className="mt-8 inline-block text-[#FFD56C] hover:underline">
                    ← Kembali ke Berita
                </Link>
            </div>
            <Footer />
        </main>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/berita/[slug]/
git commit -m "feat: add berita detail page with slug routing"
```

---

## Task 7: Update Card di `/berita/page.tsx` — Klik ke Slug

**Files:** Modify: `app/berita/page.tsx`

- [ ] **Step 1: Update card navigation logic**

Ganti bagian card rendering. Jika `activity.slug` ada, link ke `/berita/${activity.slug}`. Jika tidak, fallback ke external `link` atau non-clickable.

Ganti `<article>` dengan wrapper `<a>`:

```tsx
{filteredActivities.map((activity) => {
    const hasSlug = !!activity.slug;
    const cardHref = hasSlug ? `/berita/${activity.slug}` : (activity.link || null);

    return (
        <article
            key={activity.id}
            className="group relative min-h-90 overflow-hidden rounded-2xl border border-white/20 bg-[#11131a]"
        >
            {/* ... existing image + content code ... */}

            {cardHref ? (
                hasSlug ? (
                    <Link href={cardHref} className="absolute inset-0 z-20" />
                ) : (
                    <a
                        href={activity.link!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-20"
                    />
                )
            ) : null}
        </article>
    );
})}
```

Tambah import `Link` dari `next/link`.

- [ ] **Step 2: Commit**

```bash
git add app/berita/page.tsx
git commit -m "feat: card navigation uses slug-based URL"
```

---

## Task 8: Admin News — Tiptap Editor + Slug/Meta Fields

**Files:** Modify: `app/admin/news/page.tsx`

- [ ] **Step 1: Install Tiptap dan setup editor component**

Create: `components/tiptap/TiptapEditor.tsx`

```tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';
import { uploadActivitiesImage } from '@/lib/uploadImage';

interface TiptapEditorProps {
    content: string;
    onChange: (json: Record<string, unknown>) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false, allowBase64: true }),
            Placeholder.configure({ placeholder: 'Tulis berita di sini...' }),
        ],
        content: content ? JSON.parse(content) : undefined,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
    });

    const handleImageUpload = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !editor) return;
            try {
                const url = await uploadActivitiesImage(file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (err) {
                console.error('Upload failed:', err);
            }
        };
        input.click();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="border border-white/20 rounded-xl overflow-hidden bg-[#11131a]">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-[#1a1b23]">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    B
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    I
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    H2
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    H3
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    List
                </button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-3 py-1 rounded text-sm ${editor.isActive('blockquote') ? 'bg-[#FFD56C] text-black' : 'text-white hover:bg-white/10'}`}>
                    Quote
                </button>
                <button type="button" onClick={handleImageUpload}
                    className="px-3 py-1 rounded text-sm text-white hover:bg-white/10">
                    📷 Image
                </button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose prose-invert max-w-none p-4 min-h-[300px] text-white [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-neutral-500 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
            />
        </div>
    );
}
```

- [ ] **Step 2: Update form di admin page**

Tambah field slug (auto-generated), meta_title, meta_description. Ganti textarea content dengan TiptapEditor.

Tambah state:
```tsx
const [bodyJson, setBodyJson] = useState<Record<string, unknown>>({ type: 'doc', content: [{ type: 'paragraph' }] });
const [slug, setSlug] = useState('');
const [metaTitle, setMetaTitle] = useState('');
const [metaDescription, setMetaDescription] = useState('');
```

Tambah slug auto-generation saat title berubah:
```tsx
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Di handleTitleChange:
const autoSlug = generateSlug(e.target.value);
if (!slug || slug === generateSlug(formData.title)) {
    setSlug(autoSlug);
}
```

- [ ] **Step 3: Update handleSubmit — extract content + images**

```tsx
function extractTextFromTiptap(json: Record<string, unknown>): string {
    const content = (json.content as Array<{ content?: Array<{ text?: string }> }> | undefined) ?? [];
    return content
        .flatMap((block) => block.content ?? [])
        .map((inline) => inline.text ?? '')
        .join(' ')
        .slice(0, 300);
}

function extractImagesFromTiptap(json: Record<string, unknown>): string[] {
    const images: string[] = [];
    function walk(node: Record<string, unknown>) {
        if (node.type === 'image' && node.attrs?.src) {
            images.push(node.attrs.src as string);
        }
        if (Array.isArray(node.content)) {
            node.content.forEach((child) => walk(child as Record<string, unknown>));
        }
    }
    walk(json);
    return images;
}
```

- [ ] **Step 4: Commit**

```bash
git add components/tiptap/ app/admin/news/page.tsx
git commit -m "feat: add Tiptap editor to admin news with slug/meta fields"
```

---

## Task 9: Commit semua perubahan

```bash
git add -A
git commit -m "feat: portal berita HMTI — slug pages, Tiptap editor, SEO meta"
git log --oneline
```

---

## Verifikasi

- [ ] Buka `/berita` — card berita sudah navigasi ke `/berita/[slug]`
- [ ] Buat berita baru di admin — slug auto-generate, Tiptap editor jalan, image upload works
- [ ] Buka `/berita/[slug]` — halaman detail tampil dengan hero image + body
- [ ] Check 404 — buka `/berita/tidak-ada` → tampil 404 page
- [ ] Check SEO — view source halaman detail, `<title>` dan `<meta description>` terisi
