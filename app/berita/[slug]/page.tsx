import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchPublicNewsBySlug } from '@/lib/public-data-server';
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

    const formattedDate = new Date(news.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />

            {/* Hero */}
            <section className="relative flex min-h-[400px] items-end pt-28 md:min-h-[520px]">
                {news.image_url ? (
                    <Image
                        src={news.image_url}
                        alt={news.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-neutral-700 via-neutral-800 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#0f1014] via-black/55 to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,213,108,0.2),transparent_50%)]" />

                <div className="container relative z-10 pb-10 md:pb-14">
                    <div className="mx-auto max-w-4xl">
                        {/* Breadcrumb */}
                        <nav className="mb-6 text-sm text-neutral-300">
                            <Link href="/berita" className="hover:text-white transition">Berita</Link>
                            {news.category && (
                                <>
                                    <span className="mx-2 text-neutral-500">/</span>
                                    <span className="text-white">{news.category}</span>
                                </>
                            )}
                        </nav>

                        {/* Category Badge */}
                        {news.category && (
                            <span className="mb-4 inline-block rounded-full border border-white/20 bg-black/45 px-4 py-1 text-sm text-neutral-100 backdrop-blur">
                                {news.category}
                            </span>
                        )}

                        {/* Title */}
                        <h1
                            className="mb-5 max-w-4xl text-4xl leading-[1.05] text-white md:text-6xl"
                            style={{ fontFamily: 'var(--font-bentham)' }}
                        >
                            {news.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-col gap-1 text-sm text-neutral-200 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 p-2">
                            <time>{formattedDate}</time>
                            {news.author && (
                                <>
                                    <span className="hidden text-neutral-500 sm:inline">•</span>
                                    <span>Oleh {news.author}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="container py-10 md:py-14">
                <div className="mx-auto max-w-3xl">
                    {/* Body */}
                    {news.body && (
                        <div className="prose prose-invert prose-lg max-w-none tracking-normal prose-headings:tracking-normal prose-p:tracking-normal prose-p:leading-8 prose-li:tracking-normal prose-li:leading-8">
                            <TiptapRenderer content={news.body} />
                        </div>
                    )}

                    {/* Fallback if no body */}
                    {!news.body && (
                        <p className="text-neutral-300 leading-8 tracking-normal">{news.content}</p>
                    )}

                    {/* Back Button */}
                    <div className="mt-12">
                        <Link
                            href="/berita"
                            className="inline-flex items-center gap-2 py-4 text-[#FFD56C] hover:underline"
                        >
                            ← Kembali ke berita
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
