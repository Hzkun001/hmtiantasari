'use client';

import { useEffect, useState } from 'react';
import { supabase, CalendarEvent } from '@/lib/supabase';

type FormData = {
    title: string;
    start_at: string;
    organizer_department: string;
};

function toDatetimeLocalValue(rawValue?: string): string {
    if (!rawValue) return '';

    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return '';

    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatStartAt(rawValue: string): string {
    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export default function AdminCalendarEventsPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        start_at: '',
        organizer_department: '',
    });
    const [uploadingForm, setUploadingForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCalendarEvents();
    }, []);

    async function fetchCalendarEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from('CalendarEvents')
            .select('*')
            .order('start_at', { ascending: false });

        if (error) {
            console.error('Error fetching calendar events:', error);
            setError('Failed to load calendar events');
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    }

    function resetForm() {
        setFormData({
            title: '',
            start_at: '',
            organizer_department: '',
        });
        setEditingEvent(null);
        setShowForm(false);
        setError(null);
    }

    function handleEdit(event: CalendarEvent) {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            start_at: toDatetimeLocalValue(event.start_at),
            organizer_department: event.organizer_department,
        });
        setShowForm(true);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUploadingForm(true);

        if (!formData.title.trim() || !formData.start_at || !formData.organizer_department.trim()) {
            setError('Title, start time, and organizer department are required');
            setUploadingForm(false);
            return;
        }

        try {
            const payload = {
                title: formData.title.trim(),
                start_at: new Date(formData.start_at).toISOString(),
                organizer_department: formData.organizer_department.trim(),
            };

            if (editingEvent) {
                const { error } = await supabase
                    .from('CalendarEvents')
                    .update(payload)
                    .eq('id', editingEvent.id);

                if (error) throw error;
                setSuccess('Calendar event updated successfully!');
            } else {
                const { error } = await supabase
                    .from('CalendarEvents')
                    .insert(payload);

                if (error) throw error;
                setSuccess('Calendar event created successfully!');
            }

            await fetchCalendarEvents();
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save calendar event');
        } finally {
            setUploadingForm(false);
        }
    }

    async function handleDelete(event: CalendarEvent) {
        if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
            return;
        }

        try {
            const { error, count } = await supabase
                .from('CalendarEvents')
                .delete({ count: 'exact' })
                .eq('id', event.id);

            if (error) throw error;
            if (!count) {
                throw new Error('Delete ditolak policy (RLS) atau data tidak ditemukan.');
            }

            setSuccess('Calendar event deleted successfully!');
            await fetchCalendarEvents();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete calendar event');
        }
    }

    if (loading) {
        return (
            <div className="admin-shell">
                <div className="admin-card">
                    <p className="admin-text-center">Loading calendar events...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            <div className="admin-header-section">
                <div className="admin-header-content">
                    <div>
                        <h1 className="admin-page-title">Calendar Events</h1>
                        <p className="admin-page-subtitle">Manage homepage activity calendar entries</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="admin-button-add"
                    >
                        {showForm ? 'Cancel' : '+ Add Event'}
                    </button>
                </div>
            </div>

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

            {showForm && (
                <div className="admin-card admin-form-card">
                    <h2 className="admin-form-title">
                        {editingEvent ? 'Edit Calendar Event' : 'New Calendar Event'}
                    </h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="admin-form-input"
                                placeholder="e.g., Workshop React Dasar"
                                required
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Start Time *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_at}
                                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                    className="admin-form-input"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Organizer Department *</label>
                                <input
                                    type="text"
                                    value={formData.organizer_department}
                                    onChange={(e) => setFormData({ ...formData, organizer_department: e.target.value })}
                                    className="admin-form-input"
                                    placeholder="e.g., Departemen Ristek"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="submit"
                                disabled={uploadingForm}
                                className="admin-button-primary"
                            >
                                {uploadingForm ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
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

            {events.length > 0 ? (
                <div className="admin-activities-grid">
                    {events.map((event) => (
                        <div key={event.id} className="admin-activity-card">
                            <div
                                className="admin-activity-card-image flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(255, 213, 108, 0.08)' }}
                            >
                                <p
                                    className="px-4 text-center text-sm md:text-base"
                                    style={{ color: 'var(--admin-accent)' }}
                                >
                                    {formatStartAt(event.start_at)}
                                </p>
                            </div>

                            <div className="admin-activity-card-body">
                                <p className="admin-activity-card-meta">
                                    Waktu mulai
                                </p>
                                <h2 className="admin-activity-card-title">
                                    {event.title}
                                </h2>
                                <p className="admin-activity-card-desc">
                                    Proker: {event.organizer_department}
                                </p>

                                <div className="admin-activity-card-actions">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="admin-button-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event)}
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
                    <p className="admin-text-center">No calendar events found. Click "Add Event" to create one.</p>
                </div>
            )}
        </div>
    );
}
