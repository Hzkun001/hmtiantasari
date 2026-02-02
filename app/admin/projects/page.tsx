'use client';

import { useState, useEffect } from 'react';
import { supabase, Project } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        setLoading(true);
        const { data, error } = await supabase
            .from('Projects')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data || []);
        }
        setLoading(false);
    }

    const handleUploadSuccess = (projectId: number, imageUrl: string) => {
        setProjects(projects.map(p =>
            p.id === projectId ? { ...p, image_url: imageUrl } : p
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Manage Project Images</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {project.title}
                                </h2>
                                <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                                <p className="text-xs text-gray-500">Size: {project.size || 'not set'}</p>
                            </div>

                            {project.image_url ? (
                                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                                    <Image
                                        src={project.image_url}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-48 mb-4 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No image</span>
                                </div>
                            )}

                            <ImageUpload
                                projectId={project.id}
                                onUploadSuccess={(imageUrl) => handleUploadSuccess(project.id, imageUrl)}
                            />
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No projects found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
