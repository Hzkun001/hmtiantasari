'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Activity, fetchNewsRecords } from '@/lib/supabase';
import { getCloudinaryFetchImageUrl } from '@/lib/cloudinary';

type ActivityCard = Activity & {
    categoryLabel: string;
};

const DEFAULT_CATEGORY = 'General';

function formatCategoryLabel(value: string): string {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function inferActivityCategory(activity: Activity): string {
    const rawCategory = activity.category?.trim();
    if (rawCategory) return formatCategoryLabel(rawCategory);

    const activityText = [activity.title, activity.content].join(' ').toLowerCase();

    if (/(workshop|pelatihan|kelas|bootcamp)/.test(activityText)) {
        return 'Workshop';
    }

    if (/(seminar|talkshow|diskusi|webinar)/.test(activityText)) {
        return 'Seminar';
    }

    if (/(kolaborasi|kunjungan|kemitraan|partnership)/.test(activityText)) {
        return 'Kolaborasi';
    }

    if (/(pengabdian|sosial|donasi|bakti)/.test(activityText)) {
        return 'Pengabdian';
    }

    return DEFAULT_CATEGORY;
}

function formatTotalActivities(count: number): string {
    return `${count} kegiatan`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function normalizeExternalLink(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export default function KegiatanPage() {
    const [activities, setActivities] = useState<ActivityCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchActivities() {
            setLoading(true);

            try {
                const { data } = await fetchNewsRecords();
                if (!mounted) return;

                const normalizedActivities = (data ?? []).map((activity) => ({
                    ...activity,
                    categoryLabel: inferActivityCategory(activity),
                }));

                setActivities(normalizedActivities);
                setError(null);
            } catch (fetchError) {
                if (!mounted) return;
                console.error('Error fetching activities for kegiatan page:', fetchError);
                setError('Kegiatan belum dapat dimuat. Silakan coba lagi.');
                setActivities([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchActivities();

        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(activities.map((activity) => activity.categoryLabel))).sort();
        return ['All', ...uniqueCategories];
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return activities.filter((activity) => {
            const matchesCategory = activeCategory === 'All' || activity.categoryLabel === activeCategory;
            if (!matchesCategory) return false;

            if (!normalizedQuery) return true;

            const searchableText = [
                activity.title,
                activity.content,
                activity.categoryLabel,
                activity.author ?? '',
                activity.date,
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedQuery);
        });
    }, [activities, activeCategory, searchQuery]);

    return (
        <main className="min-h-screen bg-[#0f1014] text-white">
            <Header />

            <section className="pt-28 md:pt-32 pb-8 md:pb-10 border-b border-white/10">
                <div className="container">
                    <div className="mx-auto max-w-6xl">
                        <h1
                            className="text-center text-4xl sm:text-5xl md:text-6xl text-white"
                            style={{ fontFamily: 'var(--font-bentham)' }}
                        >
                            Berita HMTI
                        </h1>
                        <p className="mt-4 text-center text-sm md:text-base text-neutral-300">
                            Berita terbaru lingkup Teknologi Informasi yang telah dipublikasikan.
                        </p>

                        <div className="mt-8 relative">
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="7"></circle>
                                <path d="m20 20-3.5-3.5"></path>
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search news..."
                                className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-base text-white placeholder:text-neutral-400 outline-none transition focus:border-[#FFD56C] focus:bg-white/15"
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`rounded-xl border px-4 py-2 text-sm md:text-base transition ${activeCategory === category
                                        ? 'border-[#FFD56C] bg-[#FFD56C]/20 text-[#FFD56C]'
                                        : 'border-white/15 bg-white/5 text-neutral-200 hover:border-white/40'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <p className="mt-6 text-sm md:text-base text-neutral-300">
                            Menampilkan {formatTotalActivities(filteredActivities.length)} berita
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-10 md:py-14">
                <div className="container">
                    <div className="mx-auto max-w-6xl">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-90 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-200">
                                {error}
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                                <p className="text-lg md:text-xl text-neutral-100">Kegiatan tidak ditemukan.</p>
                                <p className="mt-2 text-sm md:text-base text-neutral-400">
                                    Coba kata kunci lain atau pilih kategori berbeda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredActivities.map((activity) => {
                                    const activityLink = normalizeExternalLink(activity.link);
                                    const optimizedImageUrl = getCloudinaryFetchImageUrl(activity.image_url, {
                                        width: 1280,
                                        height: 800,
                                        crop: 'fill',
                                        gravity: 'auto',
                                        quality: 'auto:good',
                                    });

                                    return (
                                        <article
                                            key={activity.id}
                                            className="group relative min-h-90 overflow-hidden rounded-2xl border border-white/20 bg-[#11131a]"
                                        >
                                        <div className="absolute inset-0">
                                            {activity.image_url ? (
                                                <Image
                                                    src={optimizedImageUrl || activity.image_url}
                                                    alt={activity.title}
                                                    fill
                                                    className="object-cover transition duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-linear-to-br from-neutral-700 via-neutral-800 to-neutral-900" />
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,213,108,0.25),transparent_35%)]" />
                                        </div>

                                        <div className="relative z-10 flex h-full flex-col justify-between p-6 pointer-events-none">
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="inline-block rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs tracking-wide text-neutral-100">
                                                    {activity.categoryLabel}
                                                </span>
                                                <time className="text-xs text-neutral-300">{formatDate(activity.date)}</time>
                                            </div>
                                            <div>
                                                <h2
                                                    className="text-2xl md:text-3xl text-white"
                                                    style={{ fontFamily: 'var(--font-bentham)' }}
                                                >
                                                    {activity.title}
                                                </h2>
                                                <p className="mt-2 text-sm md:text-base text-neutral-200 leading-relaxed">
                                                    {activity.content}
                                                </p>
                                                {activity.author ? (
                                                    <p className="mt-3 text-xs md:text-sm text-neutral-300">
                                                        Oleh {activity.author}
                                                    </p>
                                                ) : null}
                                                {activityLink ? (
                                                    <p className="mt-3 text-xs md:text-sm text-[#FFD56C]">
                                                        Baca selengkapnya →
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {activityLink ? (
                                            <a
                                                href={activityLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Buka berita: ${activity.title}`}
                                                className="absolute inset-0 z-20"
                                            />
                                        ) : null}
                                    </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
