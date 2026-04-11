import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchPublicNewsBySlug } from '@/lib/public-data-server';
import { getCloudinaryFetchImageUrl } from '@/lib/cloudinary';
import { TiptapRenderer } from '@/components/tiptap/renderer';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const news = await fetchPublicNewsBySlug(slug);
    if (!news) return {};

    return {
        title: news.meta_title ?? `${news.title} - HMTI`,
        description: news.meta_description ?? news.content,
        openGraph: {
            images: news.image_url ? [news.image_url] : [],
        },
    };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const news = await fetchPublicNewsBySlug(slug);

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
                        <Link href="/berita" className="hover:text-white transition">Berita</Link>
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
                            <TiptapRenderer content={news.body} />
                        </div>
                    )}

                    {/* Fallback if no body */}
                    {!news.body && (
                        <p className="text-neutral-300">{news.content}</p>
                    )}

                    {/* Back Button */}
                    <div className="mt-12">
                        <Link
                            href="/berita"
                            className="inline-flex items-center gap-2 text-[#FFD56C] hover:underline"
                        >
                            ← Kembali ke Berita
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
