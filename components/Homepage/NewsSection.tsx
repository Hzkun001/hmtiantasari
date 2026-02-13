'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Activity, fetchNewsRecords } from '@/lib/supabase';

const HOMEPAGE_NEWS_LIMIT = 6;
const NEWS_IMAGE_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px';

export default function ActivitiesSection() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const { data } = await fetchNewsRecords({
                    limit: HOMEPAGE_NEWS_LIMIT,
                    columns: 'id,title,content,image_url,date,category,author,link',
                });
                setActivities(data || []);
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError(err instanceof Error ? err.message : 'Failed to load activities');
            } finally {
                setLoading(false);
            }
        }

        fetchActivities();
    }, []);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <section className="relative pt-20 sm:pt-24 md:pt-48 lg:pt-64 pb-24 md:pb-40 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-neutral-600">Memuat aktivitas...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative pt-20 sm:pt-24 md:pt-48 lg:pt-64 pb-24 md:pb-40 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="activities" className="relative pt-1 sm:pt-2 md:pt-5 lg:pt-10 pb-10 md:pb-15 bg-white">
            <div className="container">
                {/* Main Title - Always visible at top center */}
                <div className="text-center mb-12 md:mb-16 lg:mb-20">
                    <h2
                        className="text-3xl md:text-4xl lg:text-6xl font-bold text-neutral-900 text-center mt-2 mb-3"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        Berita Terkini
                    </h2>
                </div>

                {/* Blog-style Grid */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {activities.map((activity) => (
                            <article
                                key={activity.id}
                                className="group bg-white overflow-hidden border border-neutral-200 flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative w-full h-64 overflow-hidden">
                                    {activity.image_url ? (
                                        <Image
                                            src={activity.image_url}
                                            alt={activity.title}
                                            fill
                                            className="object-cover"
                                            sizes={NEWS_IMAGE_SIZES}
                                            quality={62}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                                            <span className="text-neutral-400 text-lg">Tidak ada gambar</span>
                                        </div>
                                    )}
                                    {activity.category && (
                                        <div className="absolute top-3 left-4">
                                            <span className="inline-block px-2! py-1! bg-black/50 backdrop-blur-md text-[#fbd784] text-xs font-semibold rounded-full leading-none!">
                                                {activity.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col grow">
                                    {/* Date */}
                                    <div className="flex items-center gap-3 mb-3 text-sm text-neutral-500">
                                        <time dateTime={activity.date}>
                                            {formatDate(activity.date)}
                                        </time>
                                        {activity.author && (
                                            <>
                                                <span>•</span>
                                                <span>{activity.author}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
                                        {activity.title}
                                    </h3>

                                    {/* Description/Content Preview */}
                                    <p className="text-neutral-600 text-sm md:text-base line-clamp-3 grow">
                                        {activity.content}
                                    </p>

                                    {/* Read More Link */}
                                    <div className="mt-4 pt-4 border-t border-neutral-200">
                                        {activity.link ? (
                                            <a
                                                href={activity.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 inline-flex items-center gap-2 transition-colors"
                                            >
                                                Read More
                                                <svg
                                                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <span className="text-sm font-semibold text-neutral-400 inline-flex items-center gap-2">
                                                No Link Available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Empty State */}
                    {activities.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-neutral-500 text-lg">Belum ada aktivitas yang ditampilkan</p>
                        </div>
                    )}
                </div>

                {/* Read More Button */}
                <div className="text-center mt-12 md:mt-16 lg:mt-20 pb-10 md:pb-15">
                    <a
                        href="/berita"
                        className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-neutral-900 text-neutral-900 font-semibold text-lg transition-all duration-300 hover:bg-neutral-900 hover:text-white"
                    >
                        Lihat Semua Berita
                        <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
