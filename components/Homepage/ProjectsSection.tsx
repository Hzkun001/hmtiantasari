'use client';

import { Fragment, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase, Project } from '@/lib/supabase';

export default function ProjectsSection() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const { data, error } = await supabase
                    .from('Projects')
                    .select('*')
                    .order('id', { ascending: true });

                if (error) throw error;

                // Add default size if not present
                const projectsWithSize = (data || []).map((project, index) => ({
                    ...project,
                    size: project.size || (['large', 'small', 'medium', 'large', 'small'][index % 5] as 'large' | 'medium' | 'small')
                }));

                setProjects(projectsWithSize);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(err instanceof Error ? err.message : 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const previewProjects = projects.slice(0, 6);

    if (loading) {
        return (
            <section className="relative mb-20 pt-32 md:pt-48 lg:pt-64 pb-20 md:pb-32 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-neutral-600">Loading projects...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative mb-20 pt-32 md:pt-48 lg:pt-64 pb-20 md:pb-32 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                </div>
            </section>
        );
    }
    return (
        <section id="projects" className="relative pt-10 sm:pt-15 md:pt-20 lg:pt-20 pb-10 md:pb-15 bg-white border-t border-b border-black">
            <div className="container">
                {/* Mobile/Tablet heading */}
                <div className="text-center mb-10 lg:hidden">
                    <h2
                        className="text-3xl sm:text-4xl font-bold text-neutral-900"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        Our Projects
                    </h2>
                </div>

                {/* Bento Grid with Heading in Center */}
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {previewProjects.map((project, index) => (
                            <Fragment key={project.id}>
                                {/* Insert heading after first card on desktop, in center position */}
                                {index === 1 && (
                                    <div
                                        className="hidden lg:flex items-center justify-center p-8 md:col-span-1 md:row-span-1"
                                    >
                                        <h2
                                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 text-center"
                                            style={{ fontFamily: 'var(--font-bentham)' }}
                                        >
                                            Our Projects
                                        </h2>
                                    </div>
                                )}

                                <div
                                    className={`
                                    relative overflow-hidden
                                    ${project.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${project.size === 'medium' ? 'md:col-span-2 md:row-span-1' : ''}
                                    ${project.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
                                `}
                                >
                                    <div className="relative w-full h-full min-h-75 md:min-h-100">
                                        {project.image_url ? (
                                            <Image
                                                src={project.image_url}
                                                alt={project.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                                                <span className="text-neutral-400">No image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                                    </div>

                                    <div className="absolute bottom-1 left-3 right-0 p-6 md:p-8">
                                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-300">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>

                <div className="mt-10 md:mt-14 text-center">
                    {projects.length > previewProjects.length && (
                        <p className="mb-4 text-sm md:text-base text-neutral-600">
                            Menampilkan {previewProjects.length} dari {projects.length} project.
                        </p>
                    )}
                    <Link
                        href="/projects"
                        className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-neutral-900 text-neutral-900 font-semibold text-lg transition-all duration-300 hover:bg-neutral-900 hover:text-white"
                    >
                        Lihat Semua Project
                        <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
