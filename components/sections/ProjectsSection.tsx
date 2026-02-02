'use client';

import { Fragment, useState, useEffect } from 'react';
import Image from 'next/image';
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
        <section className="relative mb-20 pt-32 md:pt-48 lg:pt-64 pb-20 md:pb-32 bg-white">
            <div className="container">
                {/* Main Title - Always visible at top center */}
                <div className="text-center mb-12 md:mb-16 lg:mb-20">
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        I
                    </h2>
                </div>

                {/* Bento Grid with Heading in Center */}
                <div className="max-w-auto mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {projects.map((project, index) => (
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
                                    relative overflow-hidden rounded-xl bg-neutral-100
                                    ${project.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${project.size === 'medium' ? 'md:col-span-1 md:row-span-1' : ''}
                                    ${project.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
                                `}
                                >
                                    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    </div>

                                    <div className="absolute bottom-1 left-3 right-0 p-6 md:p-8">
                                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-300">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>
                <div className="text-center mb-12 md:mb-16 lg:mb-20">
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        I
                    </h2>
                </div>
            </div>
        </section>
    );
}
