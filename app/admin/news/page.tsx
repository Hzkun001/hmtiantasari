'use client';

import { useState, useEffect } from 'react';
import { supabase, Activity } from '@/lib/supabase';
import { uploadActivitiesImage, deleteActivitiesImage } from '@/lib/uploadImage';
import Image from 'next/image';
import TiptapEditor from '@/components/tiptap/TiptapEditor';

type FormData = {
    title: string;
    content: string;
    date: string;
    category?: string;
    author?: string;
    link?: string;
};

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function extractTextFromTiptap(json: Record<string, unknown>): string {
    const content = (json.content as Array<{ content?: Array<{ text?: string }> }> | undefined) ?? [];
    return content
        .flatMap((block) => block.content ?? [])
        .map((inline) => inline.text ?? '')
        .join(' ')
        .slice(0, 300);
}

function extractImagesFromTiptap(json: Record<string, unknown>): string[] {
    const images: string[] = [];
    function walk(node: Record<string, unknown>) {
        if (node.type === 'image' && node.attrs?.src) {
            images.push(node.attrs.src as string);
        }
        if (Array.isArray(node.content)) {
            node.content.forEach((child) => walk(child as Record<string, unknown>));
        }
    }
    walk(json);
    return images;
}

export default function AdminActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '',
        date: '',
        category: '',
        author: '',
        link: '',
    });

    const [bodyJson, setBodyJson] = useState<Record<string, unknown>>({
        type: 'doc',
        content: [{ type: 'paragraph' }],
    });
    const [slug, setSlug] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    const [uploadingImage, setUploadingImage] = useState<number | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingForm, setUploadingForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();
    }, []);

    async function fetchActivities() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('News')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setActivities(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activities');
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            title: '',
            content: '',
            date: '',
            category: '',
            author: '',
            link: '',
        });
        setBodyJson({ type: 'doc', content: [{ type: 'paragraph' }] });
        setSlug('');
        setMetaTitle('');
        setMetaDescription('');
        setSelectedImageFile(null);
        setImagePreview(null);
        setEditingActivity(null);
        setShowForm(false);
        setError(null);
    }

    function handleEdit(activity: Activity) {
        setEditingActivity(activity);

        // Parse body if exists
        let parsedBody: Record<string, unknown> = { type: 'doc', content: [{ type: 'paragraph' }] };
        if ((activity as Record<string, unknown>).body) {
            try {
                parsedBody = (activity as Record<string, unknown>).body as Record<string, unknown>;
            } catch {
                // use default
            }
        }

        setFormData({
            title: activity.title,
            content: activity.content,
            date: activity.date,
            category: activity.category || '',
            author: activity.author || '',
            link: activity.link || '',
        });
        setBodyJson(parsedBody);
        setSlug((activity as Record<string, unknown>).slug as string || generateSlug(activity.title));
        setMetaTitle((activity as Record<string, unknown>).meta_title as string || '');
        setMetaDescription((activity as Record<string, unknown>).meta_description as string || '');
        setImagePreview(activity.image_url);
        setSelectedImageFile(null);
        setShowForm(true);
        setError(null);
    }

    function handleTitleChange(value: string) {
        setFormData((prev) => ({ ...prev, title: value }));

        // Auto-generate slug if not manually edited
        const currentSlug = slug;
        const expectedAutoSlug = generateSlug(formData.title);
        if (!currentSlug || currentSlug === expectedAutoSlug || currentSlug === '') {
            setSlug(generateSlug(value));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploadingForm(true);

        if (!formData.title.trim() || !formData.date) {
            setError('Title and date are required');
            setUploadingForm(false);
            return;
        }

        try {
            let imageUrl: string | null = imagePreview;

            // Upload new image if selected
            if (selectedImageFile) {
                imageUrl = await uploadActivitiesImage(selectedImageFile);
            }

            // Extract text and images from Tiptap
            const extractedContent = extractTextFromTiptap(bodyJson);
            const extractedImages = extractImagesFromTiptap(bodyJson);
            const finalContent = extractedContent || formData.content;
            const finalSlug = slug || generateSlug(formData.title);

            const newsData: Record<string, unknown> = {
                title: formData.title,
                content: finalContent,
                body: bodyJson,
                slug: finalSlug,
                meta_title: metaTitle || null,
                meta_description: metaDescription || null,
                images: extractedImages,
                date: formData.date,
                category: formData.category || null,
                author: formData.author || null,
                link: formData.link || null,
            };

            if (imageUrl) {
                newsData.image_url = imageUrl;
            }

            if (editingActivity) {
                // Update existing
                const { error } = await supabase
                    .from('News')
                    .update(newsData)
                    .eq('id', editingActivity.id);

                if (error) throw error;
                setSuccess('News updated successfully!');
            } else {
                // Create new
                const { error } = await supabase
                    .from('News')
                    .insert(newsData);

                if (error) throw error;
                setSuccess('News created successfully!');
            }

            await fetchActivities();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save news');
        } finally {
            setUploadingForm(false);
        }
    }

    async function handleDelete(activity: Activity) {
        if (!confirm(`Are you sure you want to delete "${activity.title}"?`)) {
            return;
        }

        try {
            if (activity.image_url) {
                await deleteActivitiesImage(activity.image_url);
            }

            const { error, count } = await supabase
                .from('News')
                .delete({ count: 'exact' })
                .eq('id', activity.id);

            if (error) throw error;
            if (!count) {
                throw new Error('Delete ditolak policy (RLS) atau data tidak ditemukan.');
            }

            setSuccess('News deleted successfully!');
            await fetchActivities();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete news');
        }
    }

    async function handleImageUpload(activityId: number, file: File) {
        setUploadingImage(activityId);
        setError(null);

        try {
            const imageUrl = await uploadActivitiesImage(file);

            const { error } = await supabase
                .from('News')
                .update({ image_url: imageUrl })
                .eq('id', activityId);

            if (error) throw error;

            setSuccess('Image uploaded successfully!');
            await fetchActivities();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadingImage(null);
        }
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <div className="admin-shell">
                <p className="admin-text-center">Loading...</p>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            {/* Header */}
            <div className="admin-header-section">
                <div className="admin-header-content">
                    <h1 className="admin-title">News</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="admin-button-add"
                    >
                        {showForm ? 'Cancel' : 'Add News'}
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {error && <div className="admin-alert admin-alert-error">{error}</div>}
            {success && <div className="admin-alert admin-alert-success">{success}</div>}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="admin-card admin-form-card">
                    <h2 className="admin-form-title">
                        {editingActivity ? 'Edit News' : 'Create News'}
                    </h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* Title */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="admin-form-input"
                                placeholder="News title"
                                required
                            />
                        </div>

                        {/* Body (Tiptap) */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Body (Rich Text) *</label>
                            <TiptapEditor content={bodyJson} onChange={setBodyJson} />
                        </div>

                        {/* Slug */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">URL Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="admin-form-input"
                                placeholder="auto-generated-from-title"
                            />
                            <p className="admin-form-hint">URL: /berita/{slug || 'your-slug'}</p>
                        </div>

                        {/* Meta Title */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Meta Title (SEO)</label>
                            <input
                                type="text"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                className="admin-form-input"
                                placeholder="Judul untuk SEO (opsional)"
                            />
                        </div>

                        {/* Meta Description */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Meta Description (SEO)</label>
                            <textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                className="admin-form-textarea"
                                placeholder="Deskripsi untuk SEO (opsional)"
                                rows={3}
                            />
                        </div>

                        {/* Date & Category Row */}
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Date *</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="admin-form-input"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g., Seminar, Workshop"
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Author</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="admin-form-input"
                                placeholder="Author name"
                            />
                        </div>

                        {/* External Link (deprecated) */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">External Link (Deprecated)</label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://instagram.com/@hmti"
                            />
                            <p className="admin-form-hint">Tidak diperlukan jika menggunakan slug-based URL</p>
                        </div>

                        {/* Cover Image */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Cover Image</label>
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
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="admin-form-actions">
                            <button
                                type="submit"
                                disabled={uploadingForm}
                                className="admin-button-primary"
                            >
                                {uploadingForm ? 'Saving...' : editingActivity ? 'Update News' : 'Create News'}
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

            {/* Activities Grid */}
            {activities.length > 0 ? (
                <div className="admin-activities-grid">
                    {activities.map((activity) => (
                        <div key={activity.id} className="admin-activity-card">
                            {/* Image */}
                            <div className="admin-activity-card-image">
                                {activity.image_url ? (
                                    <>
                                        <Image
                                            src={activity.image_url}
                                            alt={activity.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        {(activity as Record<string, unknown>).category && (
                                            <div className="admin-activity-badge">
                                                {(activity as Record<string, unknown>).category as string}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="admin-image-placeholder-large">No image</div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="admin-activity-card-body">
                                <div className="admin-activity-card-meta">
                                    <span>{formatDate(activity.date)}</span>
                                    {activity.author && (
                                        <>
                                            <span> • </span>
                                            <span>{activity.author}</span>
                                        </>
                                    )}
                                </div>

                                <h2 className="admin-activity-card-title">{activity.title}</h2>
                                <p className="admin-activity-card-desc">{activity.content}</p>

                                {/* Slug indicator */}
                                {(activity as Record<string, unknown>).slug && (
                                    <p className="admin-upload-status text-xs text-neutral-400 mt-2">
                                        /berita/{(activity as Record<string, unknown>).slug as string}
                                    </p>
                                )}

                                {/* Image Upload */}
                                <div className="admin-upload-section">
                                    <label className="admin-upload-label">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(activity.id, file);
                                            }}
                                            disabled={uploadingImage === activity.id}
                                            className="admin-form-file"
                                        />
                                    </label>
                                    {uploadingImage === activity.id && (
                                        <p className="admin-upload-status">Uploading...</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="admin-activity-card-actions">
                                    <button
                                        onClick={() => handleEdit(activity)}
                                        className="admin-button-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(activity)}
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
                <div className="admin-card">
                    <p className="admin-text-center">No news found. Click &quot;Add News&quot; to create one.</p>
                </div>
            )}
        </div>
    );
}
