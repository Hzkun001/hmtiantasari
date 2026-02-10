'use client';

import { useState, useEffect } from 'react';
import { supabase, Project } from '@/lib/supabase';
import { uploadProjectImage, deleteProjectImage } from '@/lib/uploadImage';
import Image from 'next/image';

type FormData = {
    title: string;
    description: string;
    size?: string;
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        size: '',
    });
    const [uploadingImage, setUploadingImage] = useState<number | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingForm, setUploadingForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
            setError('Failed to load projects');
        } else {
            setProjects(data || []);
        }
        setLoading(false);
    }

    function resetForm() {
        setFormData({ title: '', description: '', size: '' });
        setSelectedImageFile(null);
        setImagePreview(null);
        setEditingProject(null);
        setShowForm(false);
        setError(null);
    }

    function handleEdit(project: Project) {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            size: project.size || '',
        });
        setImagePreview(project.image_url);
        setSelectedImageFile(null);
        setShowForm(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploadingForm(true);

        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Title and description are required');
            setUploadingForm(false);
            return;
        }

        try {
            let imageUrl: string | null = null;

            // Upload image if selected
            if (selectedImageFile) {
                imageUrl = await uploadProjectImage(selectedImageFile);
            }

            if (editingProject) {
                // Update existing project
                const updateData: any = {
                    title: formData.title,
                    description: formData.description,
                    size: formData.size || null,
                };

                // Only update image_url if new image was uploaded
                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                const { error } = await supabase
                    .from('Projects')
                    .update(updateData)
                    .eq('id', editingProject.id);

                if (error) throw error;
                setSuccess('Project updated successfully!');
            } else {
                // Create new project
                const { error } = await supabase
                    .from('Projects')
                    .insert({
                        title: formData.title,
                        description: formData.description,
                        size: formData.size || null,
                        image_url: imageUrl,
                    });

                if (error) throw error;
                setSuccess('Project created successfully!');
            }

            await fetchProjects();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save project');
        } finally {
            setUploadingForm(false);
        }
    }

    async function handleDelete(project: Project) {
        if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
            return;
        }

        try {
            // Delete image from storage if exists
            if (project.image_url) {
                await deleteProjectImage(project.image_url);
            }

            // Delete project from database
            const { error } = await supabase
                .from('Projects')
                .delete()
                .eq('id', project.id);

            if (error) throw error;

            setSuccess('Project deleted successfully!');
            await fetchProjects();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete project');
        }
    }

    async function handleImageUpload(projectId: number, file: File) {
        setUploadingImage(projectId);
        setError(null);

        try {
            const imageUrl = await uploadProjectImage(file);

            // Update project with new image URL
            const { error } = await supabase
                .from('Projects')
                .update({ image_url: imageUrl })
                .eq('id', projectId);

            if (error) throw error;

            setSuccess('Image uploaded successfully!');
            await fetchProjects();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadingImage(null);
        }
    }

    if (loading) {
        return (
            <div className="admin-shell">
                <div className="admin-card">
                    <p className="admin-text-center">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            {/* Header */}
            <div className="admin-header-section">
                <div className="admin-header-content">
                    <div>
                        <h1 className="admin-page-title">Projects</h1>
                        <p className="admin-page-subtitle">Manage your organization projects</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="admin-button-add"
                    >
                        {showForm ? 'Cancel' : '+ Add Project'}
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}
            {success && (
                <div className="admin-alert admin-alert-success">
                    {success}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="admin-card admin-form-card">
                    <h2 className="admin-form-title">
                        {editingProject ? 'Edit Project' : 'New Project'}
                    </h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="admin-form-input"
                                placeholder="Enter project title"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="admin-form-textarea"
                                placeholder="Enter project description"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Size</label>
                            <input
                                type="text"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                className="admin-form-input"
                                placeholder="e.g., [ large, medium, small ]"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedImageFile(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setImagePreview(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="admin-form-file"
                            />
                            {imagePreview && (
                                <div className="admin-image-preview">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="admin-image-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="submit"
                                disabled={uploadingForm}
                                className="admin-button-primary"
                            >
                                {uploadingForm ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={uploadingForm}
                                className="admin-button-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects Grid */}
            {projects.length > 0 ? (
                <div className="admin-projects-grid">
                    {projects.map((project) => (
                        <div key={project.id} className="admin-project-card">
                            <div className="admin-project-card-image">
                                {project.image_url ? (
                                    <Image
                                        src={project.image_url}
                                        alt={project.title}
                                        fill
                                        className="admin-image-cover"
                                    />
                                ) : (
                                    <div className="admin-image-placeholder-large">No Image</div>
                                )}
                            </div>

                            <div className="admin-project-card-body">
                                <h3 className="admin-project-card-title">{project.title}</h3>
                                <p className="admin-project-card-desc">{project.description}</p>
                                {project.size && (
                                    <p className="admin-project-card-meta">Size: {project.size}</p>
                                )}

                                <div className="admin-upload-section">
                                    <label className="admin-upload-label">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(project.id, file);
                                            }}
                                            disabled={uploadingImage === project.id}
                                            className="admin-form-file"
                                        />
                                    </label>
                                    {uploadingImage === project.id && (
                                        <p className="admin-upload-status">Uploading...</p>
                                    )}
                                </div>

                                <div className="admin-project-card-actions">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="admin-button-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project)}
                                        className="admin-button-delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-empty-state">
                    <p>No projects found</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="admin-button-primary"
                    >
                        Create First Project
                    </button>
                </div>
            )}
        </div>
    );
}
