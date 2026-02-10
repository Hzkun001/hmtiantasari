'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadTeamImage, deleteTeamImage } from '@/lib/uploadImage';
import Image from 'next/image';

type TeamMember = {
    id: number;
    name: string;
    role: string;
    department?: string;
    bio?: string;
    image_url?: string;
    linkedin?: string;
    instagram?: string;
    created_at: string;
};

type FormData = {
    name: string;
    role: string;
    department: string;
    bio: string;
    linkedin: string;
    instagram: string;
};

// Daftar folder kategori di bucket team-images
const TEAM_CATEGORIES = [
    { value: 'BPH', label: 'BPH (Badan Pengurus Harian)' },
    { value: 'BDK', label: 'BDK (Badan Digital Kreatif)' },
    { value: 'HUKES', label: 'HUKES (Hubungan Kemasyarakatan)' },
    { value: 'KEMHAS', label: 'KEMHAS (Kemahasiswaan)' },
    { value: 'KEWISHAN', label: 'KEWISHAN (Kewirausahaan)' },
    { value: 'RISTEK', label: 'RISTEK (Riset dan Teknologi)' },
];

function inferCategoryFromDepartment(department?: string) {
    const normalized = (department || '').toUpperCase();

    if (normalized.includes('BDK') || normalized.includes('DIGIKRAF') || normalized.includes('DIGITAL KREATIF')) return 'BDK';
    if (normalized.includes('HUKES') || normalized.includes('HUBUNGAN KEMASYARAKATAN') || normalized.includes('HUMAS')) return 'HUKES';
    if (normalized.includes('KEMHAS') || normalized.includes('KEMAHASISWAAN')) return 'KEMHAS';
    if (normalized.includes('KEWISHAN') || normalized.includes('KEWIRAUSAHAAN')) return 'KEWISHAN';
    if (normalized.includes('RISTEK') || normalized.includes('RISET')) return 'RISTEK';
    if (normalized.includes('BPH')) return 'BPH';

    return 'BPH';
}

export default function TeamMembersPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        role: '',
        department: '',
        bio: '',
        linkedin: '',
        instagram: '',
    });
    const [uploadingImage, setUploadingImage] = useState<number | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingForm, setUploadingForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('BPH');
    const [uploadCategories, setUploadCategories] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('TeamMembers')
            .select('*')

        if (error) {
            console.error('Error fetching team members:', error);
            setError('Failed to load team members');
        } else {
            setMembers(data || []);
        }
        setLoading(false);
    }

    function resetForm() {
        setFormData({
            name: '',
            role: '',
            department: '',
            bio: '',
            linkedin: '',
            instagram: '',
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        setEditingMember(null);
        setShowForm(false);
        setError(null);
        setSelectedCategory('BPH');
    }

    function handleEdit(member: TeamMember) {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            department: member.department || '',
            bio: member.bio || '',
            linkedin: member.linkedin || '',
            instagram: member.instagram || '',
        });
        setImagePreview(member.image_url || null);
        setSelectedImageFile(null);
        setShowForm(true);
        setError(null);
        setSelectedCategory(inferCategoryFromDepartment(member.department));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploadingForm(true);

        if (!formData.name.trim() || !formData.role.trim()) {
            setError('Name and role are required');
            setUploadingForm(false);
            return;
        }

        try {
            let imageUrl: string | null = null;
            const resolvedDepartment = formData.department.trim() || selectedCategory;

            // Upload image if selected
            if (selectedImageFile) {
                imageUrl = await uploadTeamImage(selectedImageFile, selectedCategory);
            }

            if (editingMember) {
                // Update existing member
                const updateData: any = {
                    name: formData.name,
                    role: formData.role,
                    department: resolvedDepartment || null,
                    bio: formData.bio || null,
                    linkedin: formData.linkedin || null,
                    instagram: formData.instagram || null,
                };

                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                const { error } = await supabase
                    .from('TeamMembers')
                    .update(updateData)
                    .eq('id', editingMember.id);

                if (error) throw error;
                setSuccess('Team member updated successfully!');
            } else {
                // Create new member
                const { error } = await supabase
                    .from('TeamMembers')
                    .insert({
                        name: formData.name,
                        role: formData.role,
                        department: resolvedDepartment || null,
                        bio: formData.bio || null,
                        linkedin: formData.linkedin || null,
                        instagram: formData.instagram || null,
                        image_url: imageUrl,
                    });

                if (error) throw error;
                setSuccess('Team member added successfully!');
            }

            await fetchMembers();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save team member');
        } finally {
            setUploadingForm(false);
        }
    }

    async function handleDelete(member: TeamMember) {
        if (!confirm(`Are you sure you want to remove ${member.name}?`)) {
            return;
        }

        try {
            if (member.image_url) {
                await deleteTeamImage(member.image_url);
            }

            const { error } = await supabase
                .from('TeamMembers')
                .delete()
                .eq('id', member.id);

            if (error) throw error;

            setSuccess('Team member removed successfully!');
            await fetchMembers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete team member');
        }
    }

    async function handleImageUpload(memberId: number, file: File, category: string) {
        setUploadingImage(memberId);
        setError(null);

        try {
            const imageUrl = await uploadTeamImage(file, category);

            const { error } = await supabase
                .from('TeamMembers')
                .update({ image_url: imageUrl })
                .eq('id', memberId);

            if (error) throw error;

            setSuccess('Image uploaded successfully!');
            await fetchMembers();
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
                <p className="admin-text-center">Loading...</p>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            {/* Header */}
            <div className="admin-header-section">
                <div className="admin-header-content">
                    <div>
                        <h1 className="admin-page-title">Team Members</h1>
                        <p className="admin-page-subtitle">Manage organization team members</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="admin-button-add"
                    >
                        {showForm ? 'Cancel' : 'Add Member'}
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
                        {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                    </h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="Full name"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Role *</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g., Ketua, Sekretaris"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="admin-form-input"
                                placeholder="e.g., Divisi Humas, Divisi Teknis"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="admin-form-textarea"
                                placeholder="Short bio or description"
                                rows={4}
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">LinkedIn</label>
                                <input
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="LinkedIn profile URL"
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Instagram</label>
                            <input
                                type="text"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                className="admin-form-input"
                                placeholder="@username"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Kategori Folder *</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="admin-form-input"
                                required
                            >
                                {TEAM_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <p className="admin-form-hint">
                                Pilih kategori tim. Jika Department kosong, kategori ini otomatis dipakai untuk pengelompokan kabinet.
                            </p>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Profile Photo</label>
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
                                {uploadingForm ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
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

            {/* Team Members Grid */}
            {members.length > 0 ? (
                <div className="admin-team-grid">
                    {members.map((member) => (
                        <div key={member.id} className="admin-team-card admin-team-card--profile">
                            {/* Image Section */}
                            <div className="admin-team-card-image">
                                {member.image_url ? (
                                    <Image
                                        src={member.image_url}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="admin-team-placeholder">
                                        <span>{member.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}

                                <div className="admin-team-card-overlay">
                                    <h3 className="admin-team-card-name">{member.name}</h3>
                                    <p className="admin-team-card-role">{member.role}</p>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="admin-team-card-body">
                                {member.department && (
                                    <p className="admin-team-card-dept">{member.department}</p>
                                )}
                                {member.bio && (
                                    <p className="admin-team-card-bio">{member.bio}</p>
                                )}

                                {/* Contact Info */}
                                {(member.linkedin || member.instagram) && (
                                    <div className="admin-team-card-contact">
                                        {member.linkedin && (
                                            <div className="admin-contact-item">
                                                <span className="admin-contact-label">LinkedIn:</span>
                                                <span className="admin-contact-value">{member.linkedin}</span>
                                            </div>
                                        )}
                                        {member.instagram && (
                                            <div className="admin-contact-item">
                                                <span className="admin-contact-label">Instagram:</span>
                                                <span className="admin-contact-value">{member.instagram}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div className="admin-upload-section">
                                    <label className="admin-form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>
                                        Upload Foto
                                    </label>
                                    <select
                                        value={uploadCategories[member.id] || 'BPH'}
                                        onChange={(e) => setUploadCategories({ ...uploadCategories, [member.id]: e.target.value })}
                                        className="admin-form-input"
                                        style={{ fontSize: '0.75rem', padding: '0.5rem', marginBottom: '0.5rem' }}
                                    >
                                        {TEAM_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="admin-upload-label">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const category = uploadCategories[member.id] || 'BPH';
                                                    handleImageUpload(member.id, file, category);
                                                }
                                            }}
                                            disabled={uploadingImage === member.id}
                                            className="admin-form-file"
                                        />
                                    </label>
                                    {uploadingImage === member.id && (
                                        <p className="admin-upload-status">Uploading...</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="admin-team-card-actions">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="admin-button-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member)}
                                        className="admin-button-delete"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-card">
                    <p className="admin-text-center">No team members found. Click "Add Member" to create one.</p>
                </div>
            )}
        </div>
    );
}
