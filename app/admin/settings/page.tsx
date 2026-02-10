'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type SiteSettings = {
    id: number;
    site_name: string;
    site_tagline?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    youtube_url?: string;
    about_text?: string;
    updated_at: string;
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        site_name: '',
        site_tagline: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',
        about_text: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('SiteSettings')
                .select('*')
                .order('updated_at', { ascending: false })
                .order('id', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setSettings(data);
                setFormData({
                    site_name: data.site_name || '',
                    site_tagline: data.site_tagline || '',
                    contact_email: data.contact_email || '',
                    contact_phone: data.contact_phone || '',
                    address: data.address || '',
                    facebook_url: data.facebook_url || '',
                    twitter_url: data.twitter_url || '',
                    instagram_url: data.instagram_url || '',
                    linkedin_url: data.linkedin_url || '',
                    youtube_url: data.youtube_url || '',
                    about_text: data.about_text || '',
                });
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            if (settings) {
                // Update existing settings
                const { error } = await supabase
                    .from('SiteSettings')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', settings.id);

                if (error) throw error;
            } else {
                // Create new settings
                const { error } = await supabase
                    .from('SiteSettings')
                    .insert({
                        ...formData,
                    });

                if (error) throw error;
            }

            setSuccess('Settings saved successfully!');
            await fetchSettings();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
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
                        <h1 className="admin-page-title">Settings</h1>
                        <p className="admin-page-subtitle">Manage your site configuration</p>
                    </div>
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

            <form onSubmit={handleSubmit}>
                {/* General Settings */}
                <div className="admin-card admin-settings-section">
                    <h2 className="admin-settings-section-title">General Information</h2>
                    <p className="admin-page-subtitle" style={{ marginTop: '-8px', marginBottom: '14px' }}>
                        Dipakai untuk judul website, metadata SEO, dan identitas utama di layout.
                    </p>
                    <div className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Site Name</label>
                            <input
                                type="text"
                                value={formData.site_name}
                                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                                className="admin-form-input"
                                placeholder="HMTI UIN Antasari"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Site Tagline</label>
                            <input
                                type="text"
                                value={formData.site_tagline}
                                onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                                className="admin-form-input"
                                placeholder="Kabinet Arnanta"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">About Text</label>
                            <textarea
                                value={formData.about_text}
                                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                                className="admin-form-textarea"
                                placeholder="Deskripsi singkat organisasi (dipakai sebagai metadata description)"
                                rows={6}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="admin-card admin-settings-section">
                    <h2 className="admin-settings-section-title">Contact Information</h2>
                    <p className="admin-page-subtitle" style={{ marginTop: '-8px', marginBottom: '14px' }}>
                        Ditampilkan di footer website sebagai informasi kontak.
                    </p>
                    <div className="admin-form">
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Email</label>
                                <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                className="admin-form-input"
                                placeholder="hmti@uinantasari.ac.id"
                            />
                        </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Phone</label>
                                <input
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                className="admin-form-input"
                                placeholder="+62 8xx xxxx xxxx"
                            />
                        </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="admin-form-textarea"
                                placeholder="Alamat lengkap untuk footer"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="admin-card admin-settings-section">
                    <h2 className="admin-settings-section-title">Social Media Links</h2>
                    <p className="admin-page-subtitle" style={{ marginTop: '-8px', marginBottom: '14px' }}>
                        Seluruh link social media di bagian footer diambil dari sini.
                    </p>
                    <div className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Facebook URL</label>
                            <input
                                type="url"
                                value={formData.facebook_url}
                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Twitter URL</label>
                            <input
                                type="url"
                                value={formData.twitter_url}
                                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://twitter.com/youraccount"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Instagram URL</label>
                            <input
                                type="url"
                                value={formData.instagram_url}
                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://instagram.com/youraccount"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">LinkedIn URL</label>
                            <input
                                type="url"
                                value={formData.linkedin_url}
                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://linkedin.com/company/yourcompany"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">YouTube URL</label>
                            <input
                                type="url"
                                value={formData.youtube_url}
                                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                className="admin-form-input"
                                placeholder="https://youtube.com/yourchannel"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="admin-settings-actions">
                    <button
                        type="submit"
                        disabled={saving}
                        className="admin-button-primary admin-button-save"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
