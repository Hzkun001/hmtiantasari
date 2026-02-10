'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase, Activity } from '@/lib/supabase';
import './kegiatan.css';

type ProgramItem = {
    title: string;
    description: string;
    output: string;
};

type TimelineItem = {
    quarter: string;
    agenda: string;
    focus: string;
};

type FlowItem = {
    step: string;
    title: string;
    description: string;
};

type ActivityCard = {
    id: number | string;
    title: string;
    content: string;
    date: string;
    category?: string;
    author?: string;
    link?: string;
    image_url?: string | null;
};

const PROGRAM_ITEMS: ProgramItem[] = [
    {
        title: 'Penguatan Internal',
        description: 'Rapat kerja, upgrading pengurus, dan forum evaluasi untuk menjaga ritme organisasi tetap sehat.',
        output: 'Dokumen kerja, SOP kegiatan, dan perbaikan alur koordinasi.',
    },
    {
        title: 'Akademik & Teknologi',
        description: 'Workshop, kelas teknis, dan mini project kolaboratif untuk meningkatkan kemampuan anggota.',
        output: 'Portofolio teknis, dokumentasi kelas, serta hasil project berbasis kebutuhan nyata.',
    },
    {
        title: 'Relasi & Pengabdian',
        description: 'Kegiatan sosial, kunjungan mitra, serta program kolaborasi dengan komunitas dan lembaga eksternal.',
        output: 'Jejaring kerja sama, dampak sosial, dan eksposur positif himpunan.',
    },
];

const TIMELINE_ITEMS: TimelineItem[] = [
    {
        quarter: 'Q1',
        agenda: 'Rapat Kerja & Upgrading',
        focus: 'Sinkronisasi program kerja, pembagian peran, dan penguatan budaya organisasi.',
    },
    {
        quarter: 'Q2',
        agenda: 'Kelas Teknis & Seminar',
        focus: 'Peningkatan skill anggota melalui materi teknologi yang relevan dan terukur.',
    },
    {
        quarter: 'Q3',
        agenda: 'Kompetisi & Kolaborasi',
        focus: 'Implementasi project, partisipasi lomba, serta sinergi lintas organisasi.',
    },
    {
        quarter: 'Q4',
        agenda: 'Pengabdian & Evaluasi',
        focus: 'Program kontribusi sosial, publikasi capaian, dan evaluasi akhir periode.',
    },
];

const FLOW_ITEMS: FlowItem[] = [
    {
        step: '01',
        title: 'Perencanaan',
        description: 'Penetapan tujuan, target peserta, indikator keberhasilan, dan timeline kegiatan.',
    },
    {
        step: '02',
        title: 'Eksekusi',
        description: 'Pelaksanaan kegiatan sesuai rundown dengan monitoring teknis dan komunikasi intensif.',
    },
    {
        step: '03',
        title: 'Publikasi',
        description: 'Dokumentasi hasil kegiatan untuk media himpunan dan pelaporan kepada anggota.',
    },
    {
        step: '04',
        title: 'Evaluasi',
        description: 'Review output, umpan balik peserta, serta rekomendasi peningkatan kegiatan berikutnya.',
    },
];

const FALLBACK_ACTIVITIES: ActivityCard[] = [
    {
        id: 'fallback-1',
        title: 'Workshop Frontend Dasar',
        content: 'Pelatihan dasar frontend untuk anggota baru agar siap mengikuti mini project internal.',
        date: '2025-09-12',
        category: 'Workshop',
        author: 'Departemen Ristek',
    },
    {
        id: 'fallback-2',
        title: 'Forum Silaturahmi Organisasi',
        content: 'Kegiatan kolaboratif bersama organisasi kampus untuk memperluas jejaring dan kolaborasi program.',
        date: '2025-08-28',
        category: 'Kolaborasi',
        author: 'Departemen Hukes',
    },
    {
        id: 'fallback-3',
        title: 'Aksi Sosial Mahasiswa',
        content: 'Penggalangan dan distribusi bantuan sebagai bentuk kontribusi sosial himpunan kepada masyarakat.',
        date: '2025-07-19',
        category: 'Pengabdian',
        author: 'Departemen Kemhas',
    },
];

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function KegiatanPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchActivities() {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('Activities')
                .select('*')
                .order('date', { ascending: false })
                .limit(6);

            if (!mounted) return;

            if (fetchError) {
                console.error('Error fetching activities for kegiatan page:', fetchError);
                setError('Data kegiatan terbaru belum dapat dimuat. Menampilkan konten contoh.');
                setActivities([]);
            } else {
                setError(null);
                setActivities(data ?? []);
            }

            setLoading(false);
        }

        fetchActivities();

        return () => {
            mounted = false;
        };
    }, []);

    const latestActivities = useMemo<ActivityCard[]>(() => {
        if (activities.length > 0) {
            return activities.map((item) => ({
                id: item.id,
                title: item.title,
                content: item.content,
                date: item.date,
                category: item.category,
                author: item.author,
                link: item.link,
                image_url: item.image_url,
            }));
        }

        return FALLBACK_ACTIVITIES;
    }, [activities]);

    const heroGalleryItems = useMemo<ActivityCard[]>(() => {
        const withImage = latestActivities.filter((item) => Boolean(item.image_url));
        const source = withImage.length > 0 ? withImage : latestActivities;
        if (source.length === 0) return [];
        return Array.from({ length: 5 }, (_, index) => source[index % source.length]).map((item, index) => ({
            ...item,
            id: `hero-${index}-${item.id}`,
        }));
    }, [latestActivities]);

    const heroTags = useMemo(() => {
        const tags = latestActivities
            .map((item) => item.category)
            .filter((value): value is string => Boolean(value));
        return Array.from(new Set(tags)).slice(0, 4);
    }, [latestActivities]);

    return (
        <main className="kegiatan-page">
            <Header />

            <section className="kegiatan-hero">
                <div className="kegiatan-shell kegiatan-hero-layout">
                    <div className="kegiatan-hero-copy">
                        <p className="kegiatan-eyebrow">HMTI UIN ANTASARI</p>
                        <h1 className="kegiatan-title">Galeri Kegiatan Himpunan</h1>
                        <p className="kegiatan-lead">
                            Dokumentasi momen belajar, kolaborasi, dan gerak bersama anggota.
                        </p>
                        <div className="kegiatan-hero-tags" aria-label="Kategori kegiatan">
                            {(heroTags.length > 0 ? heroTags : ['Workshop', 'Kolaborasi', 'Pengabdian']).map((tag) => (
                                <span key={tag} className="kegiatan-hero-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="kegiatan-hero-gallery" aria-label="Preview galeri kegiatan">
                        {heroGalleryItems.map((item, index) => (
                            <article key={`${item.id}-${index}`} className={`kegiatan-hero-shot kegiatan-hero-shot--${index + 1}`}>
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="kegiatan-hero-shot-image"
                                        sizes="(max-width: 992px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="kegiatan-hero-shot-placeholder" aria-hidden="true">
                                        HMTI
                                    </div>
                                )}
                                <div className="kegiatan-hero-shot-overlay">
                                    <p>{item.category ?? 'Kegiatan'}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="kegiatan-section kegiatan-section--light">
                <div className="kegiatan-shell">
                    <div className="kegiatan-section-head">
                        <h2>Program Utama Himpunan</h2>
                        <p>
                            Program kerja disusun terarah agar aktivitas himpunan bukan sekadar acara, tetapi memiliki
                            output pembelajaran dan dampak yang terukur.
                        </p>
                    </div>
                    <div className="kegiatan-program-grid">
                        {PROGRAM_ITEMS.map((item) => (
                            <article key={item.title} className="kegiatan-program-card">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <div className="kegiatan-program-output">
                                    <span>Output</span>
                                    <p>{item.output}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="kegiatan-section kegiatan-section--light kegiatan-section--timeline">
                <div className="kegiatan-shell">
                    <div className="kegiatan-section-head">
                        <h2>Kalender Kegiatan</h2>
                        <p>Ritme kegiatan tahunan dibagi per kuartal agar fokus program lebih terukur dan berkelanjutan.</p>
                    </div>
                    <div className="kegiatan-timeline">
                        {TIMELINE_ITEMS.map((item) => (
                            <article key={item.quarter} className="kegiatan-timeline-item">
                                <p className="kegiatan-timeline-quarter">{item.quarter}</p>
                                <div className="kegiatan-timeline-content">
                                    <h3>{item.agenda}</h3>
                                    <p>{item.focus}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="kegiatan-section kegiatan-section--dark">
                <div className="kegiatan-shell">
                    <div className="kegiatan-section-head kegiatan-section-head--dark">
                        <h2>Alur Pelaksanaan Kegiatan</h2>
                        <p>
                            Setiap kegiatan dijalankan dengan alur kerja yang jelas agar tim dapat mengeksekusi program
                            dengan rapi, efisien, dan terdokumentasi.
                        </p>
                    </div>
                    <div className="kegiatan-flow-grid">
                        {FLOW_ITEMS.map((item) => (
                            <article key={item.step} className="kegiatan-flow-card">
                                <p className="kegiatan-flow-step">{item.step}</p>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="kegiatan-section kegiatan-section--light">
                <div className="kegiatan-shell">
                    <div className="kegiatan-section-head">
                        <h2>Kegiatan Terbaru</h2>
                        <p>Dokumentasi agenda terkini yang telah dipublikasikan oleh himpunan.</p>
                    </div>

                    {error ? <p className="kegiatan-note">{error}</p> : null}
                    {loading ? <p className="kegiatan-note">Memuat kegiatan terbaru...</p> : null}

                    <div className="kegiatan-latest-grid">
                        {latestActivities.map((item) => (
                            <article key={item.id} className="kegiatan-latest-card">
                                <div className="kegiatan-latest-media">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.title}
                                            fill
                                            className="kegiatan-latest-image"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1120px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="kegiatan-latest-placeholder" aria-hidden="true">
                                            HMTI
                                        </div>
                                    )}
                                    {item.category ? <span className="kegiatan-latest-tag">{item.category}</span> : null}
                                </div>

                                <div className="kegiatan-latest-body">
                                    <p className="kegiatan-latest-meta">
                                        <time dateTime={item.date}>{formatDate(item.date)}</time>
                                        {item.author ? <span>{item.author}</span> : null}
                                    </p>
                                    <h3>{item.title}</h3>
                                    <p>{item.content}</p>
                                    {item.link ? (
                                        <a href={item.link} target="_blank" rel="noreferrer noopener" className="kegiatan-latest-link">
                                            Lihat detail
                                        </a>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
