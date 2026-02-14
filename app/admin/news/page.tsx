'use client';

import { useState, useEffect } from 'react';
import { supabase, Activity, fetchNewsRecords, NewsTableName } from '@/lib/supabase';
import { uploadActivitiesImage, deleteActivitiesImage } from '@/lib/uploadImage';
import Image from 'next/image';

type FormData = {
    title: string;
    content: string;
    date: string;
    category?: string;
    author?: string;
    link?: string;
};

export default function AdminActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [newsTable, setNewsTable] = useState<NewsTableName>('Activities');
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
            const { table, data } = await fetchNewsRecords();
            setNewsTable(table);
            setActivities(data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching activities:', error);
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
            link: ''
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        setEditingActivity(null);
        setShowForm(false);
        setError(null);
    }

    function handleEdit(activity: Activity) {
        setEditingActivity(activity);
        setFormData({
            title: activity.title,
            content: activity.content,
            date: activity.date,
            category: activity.category || '',
            author: activity.author || '',
            link: activity.link || '',
        });
        setImagePreview(activity.image_url);
        setSelectedImageFile(null);
        setShowForm(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploadingForm(true);

        if (!formData.title.trim() || !formData.content.trim() || !formData.date) {
            setError('Title, content, and date are required');
            setUploadingForm(false);
            return;
        }

        try {
            let imageUrl: string | null = null;

            // Upload image if selected
            if (selectedImageFile) {
                imageUrl = await uploadActivitiesImage(selectedImageFile);
            }

            if (editingActivity) {
                // Update existing activity
                const updateData: any = {
                    title: formData.title,
                    content: formData.content,
                    date: formData.date,
                    category: formData.category || null,
                    author: formData.author || null,
                    link: formData.link || null,
                };

                // Only update image_url if new image was uploaded
                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                const { error } = await supabase
                    .from(newsTable)
                    .update(updateData)
                    .eq('id', editingActivity.id);

                if (error) throw error;
                setSuccess('Activity updated successfully!');
            } else {
                // Create new activity
                const { error } = await supabase
                    .from(newsTable)
                    .insert({
                        title: formData.title,
                        content: formData.content,
                        date: formData.date,
                        category: formData.category || null,
                        author: formData.author || null,
                        link: formData.link || null,
                        image_url: imageUrl,
                    });

                if (error) throw error;
                setSuccess('Activity created successfully!');
            }

            await fetchActivities();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save activity');
        } finally {
            setUploadingForm(false);
        }
    }

    async function handleDelete(activity: Activity) {
        if (!confirm(`Are you sure you want to delete "${activity.title}"?`)) {
            return;
        }

        try {
            // Delete image from storage if exists
            if (activity.image_url) {
                await deleteActivitiesImage(activity.image_url);
            }

            // Delete activity from database
            const { error, count } = await supabase
                .from(newsTable)
                .delete({ count: 'exact' })
                .eq('id', activity.id);

            if (error) throw error;
            if (!count) {
                throw new Error('Delete ditolak policy (RLS) atau data tidak ditemukan.');
            }

            setSuccess('Activity deleted successfully!');
            await fetchActivities();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete activity');
        }
    }

    async function handleImageUpload(activityId: number, file: File) {
        setUploadingImage(activityId);
        setError(null);

        try {
            const imageUrl = await uploadActivitiesImage(file);

            // Update activity with new image URL
            const { error } = await supabase
                .from(newsTable)
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
            day: 'numeric'
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

            {/* Add/Edit Form */}
            {showForm && (
                <div className="admin-card admin-form-card">
                    <h2 className="admin-form-title">
                        {editingActivity ? 'Edit News' : 'Create News'}
                    </h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="admin-form-input"
                                placeholder="News title"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="admin-form-textarea"
                                placeholder="News content"
                                rows={6}
                                required
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="admin-form-input"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g., Seminar, Workshop"
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Author
                            </label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="admin-form-input"
                                placeholder="Author name"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Link
                            </label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://instagram.com/@hmti"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Image
                            </label>
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

                        <div className="admin-form-actions">
                            <button
                                type="submit"
                                disabled={uploadingForm}
                                className="admin-button-primary"
                            >
                                {uploadingForm ? 'Saving...' : (editingActivity ? 'Update News' : 'Create News')}
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
                            {/* Image Section */}
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
                                        {activity.category && (
                                            <div className="admin-activity-badge">
                                                {activity.category}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="admin-image-placeholder-large">
                                        No image
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
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

                                <h2 className="admin-activity-card-title">
                                    {activity.title}
                                </h2>
                                <p className="admin-activity-card-desc">
                                    {activity.content}
                                </p>

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

                                {/* Action Buttons */}
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
                    <p className="admin-text-center">No news found. Click "Add News" to create one.</p>
                </div>
            )}
        </div>
    );
}
