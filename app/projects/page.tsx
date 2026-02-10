'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase, Project } from '@/lib/supabase';

type ProjectCard = Project & {
    size: 'large' | 'medium' | 'small';
    category: string;
};

const DEFAULT_SIZE_PATTERN: Array<'large' | 'medium' | 'small'> = ['large', 'small', 'medium', 'large', 'small'];
const DEFAULT_CATEGORY = 'General';

function normalizeSize(rawSize: string | undefined, index: number): 'large' | 'medium' | 'small' {
    const size = rawSize?.toLowerCase().trim();

    if (size === 'large' || size === 'medium' || size === 'small') {
        return size;
    }

    return DEFAULT_SIZE_PATTERN[index % DEFAULT_SIZE_PATTERN.length];
}

function formatCategoryLabel(value: string): string {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function inferProjectCategory(project: Project): string {
    const rawSize = project.size?.trim().toLowerCase();

    if (rawSize && rawSize !== 'large' && rawSize !== 'medium' && rawSize !== 'small') {
        return formatCategoryLabel(rawSize);
    }

    const projectText = [
        project.title,
        project.description,
        ...(project.tech_stack ?? []),
    ]
        .join(' ')
        .toLowerCase();

    if (/(e-commerce|ecommerce|marketplace|online shop|toko online)/.test(projectText)) {
        return 'E-Commerce Development';
    }

    if (/(mobile|android|ios|app|flutter|react native)/.test(projectText)) {
        return 'Mobile Apps';
    }

    if (/(ux|ui\/ux|research|riset|usability|prototype)/.test(projectText)) {
        return 'UX Research';
    }

    if (/(website|web app|landing page|company profile|portal)/.test(projectText)) {
        return 'Website';
    }

    return DEFAULT_CATEGORY;
}

function formatTotalProjects(count: number): string {
    return `${count} project${count > 1 ? 's' : ''}`;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchProjects() {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('Projects')
                .select('*')
                .order('id', { ascending: false });

            if (!mounted) return;

            if (fetchError) {
                console.error('Error fetching projects for projects page:', fetchError);
                setError('Projects belum dapat dimuat. Silakan coba lagi.');
                setProjects([]);
            } else {
                const normalizedProjects = (data ?? []).map((project, index) => ({
                    ...project,
                    size: normalizeSize(project.size, index),
                    category: inferProjectCategory(project),
                }));

                setProjects(normalizedProjects);
                setError(null);
            }

            setLoading(false);
        }

        fetchProjects();

        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(projects.map((project) => project.category))).sort();
        return ['All', ...uniqueCategories];
    }, [projects]);

    const filteredProjects = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return projects.filter((project) => {
            const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
            if (!matchesCategory) return false;

            if (!normalizedQuery) return true;

            const searchableText = [
                project.title,
                project.description,
                project.category,
                ...(project.tech_stack ?? []),
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedQuery);
        });
    }, [projects, activeCategory, searchQuery]);

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
                            Explore Our Previous Works
                        </h1>
                        <p className="mt-4 text-center text-sm md:text-base text-neutral-300">
                            Halaman ini untuk eksplorasi semua project HMTI, sementara section home tetap sebagai preview.
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
                                placeholder="Search projects..."
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
                            Menampilkan {formatTotalProjects(filteredProjects.length)}
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
                        ) : filteredProjects.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
                                <p className="text-lg md:text-xl text-neutral-100">Project tidak ditemukan.</p>
                                <p className="mt-2 text-sm md:text-base text-neutral-400">
                                    Coba kata kunci lain atau pilih kategori berbeda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <article
                                        key={project.id}
                                        className="group relative min-h-90 overflow-hidden rounded-2xl border border-white/20 bg-[#11131a]"
                                    >
                                        <div className="absolute inset-0">
                                            {project.image_url ? (
                                                <Image
                                                    src={project.image_url}
                                                    alt={project.title}
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

                                        <div className="relative z-10 flex h-full flex-col justify-between p-6">
                                            <div>
                                                <span className="inline-block rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs tracking-wide text-neutral-100">
                                                    {project.category}
                                                </span>
                                            </div>
                                            <div>
                                                <h2
                                                    className="text-2xl md:text-3xl text-white"
                                                    style={{ fontFamily: 'var(--font-bentham)' }}
                                                >
                                                    {project.title}
                                                </h2>
                                                <p className="mt-2 text-sm md:text-base text-neutral-200 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
