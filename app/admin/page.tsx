'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, CalendarEvent, fetchNewsRecords } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatStartAt(rawValue: string): string {
    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export default function AdminDashboard() {
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [stats, setStats] = useState({
        totalCalendarEvents: 0,
        monthCalendarEvents: 0,
        totalNewsPosts: 0,
        totalTeamMembers: 0,
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

        const [
            { data: calendarEventsData },
            { count: totalCalendarEventsCount },
            { count: monthCalendarEventsCount },
            { count: totalTeamMembersCount },
        ] = await Promise.all([
            supabase
                .from('CalendarEvents')
                .select('*')
                .order('start_at', { ascending: true })
                .limit(5),
            supabase
                .from('CalendarEvents')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('CalendarEvents')
                .select('id', { count: 'exact', head: true })
                .gte('start_at', monthStart.toISOString())
                .lt('start_at', nextMonthStart.toISOString()),
            supabase
                .from('TeamMembers')
                .select('id', { count: 'exact', head: true }),
        ]);

        let totalNewsPostsCount = 0;
        try {
            const { data } = await fetchNewsRecords();
            totalNewsPostsCount = data.length;
        } catch (error) {
            console.error('Error fetching news stats:', error);
        }

        setCalendarEvents(calendarEventsData || []);
        setStats({
            totalCalendarEvents: totalCalendarEventsCount ?? (calendarEventsData?.length ?? 0),
            monthCalendarEvents: monthCalendarEventsCount ?? 0,
            totalNewsPosts: totalNewsPostsCount ?? 0,
            totalTeamMembers: totalTeamMembersCount ?? 0,
        });

        setLoading(false);
    }, []);

    const checkAuth = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login');
        } else {
            fetchDashboardData();
        }
    }, [fetchDashboardData, router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) {
        return (
            <div className="admin-shell">
                <div className="admin-card">
                    <p className="admin-text-center">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shell">
            <div className="admin-header-section">
                <div className="admin-dashboard-header">
                    <div className="admin-dashboard-logo" aria-hidden="true">
                        <span>H</span>
                    </div>
                    <div>
                        <h1 className="admin-page-title">Dashboard</h1>
                        <p className="admin-page-subtitle">Overview of calendar, news, and organization data</p>
                    </div>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Total Calendar Events</div>
                    <div className="admin-stat-value">{stats.totalCalendarEvents}</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Events This Month</div>
                    <div className="admin-stat-value">{stats.monthCalendarEvents}</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Total News Posts</div>
                    <div className="admin-stat-value">{stats.totalNewsPosts}</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Team Members</div>
                    <div className="admin-stat-value">{stats.totalTeamMembers}</div>
                </div>
            </div>

            <div className="admin-content-grid">
                <div className="admin-card admin-projects-section">
                    <div className="admin-card-header-row">
                        <h2 className="admin-card-title">Upcoming Calendar Events</h2>
                        <Link href="/admin/calendar-events" className="admin-link-button">
                            View All →
                        </Link>
                    </div>

                    <div className="admin-project-list">
                        {calendarEvents.length > 0 ? (
                            calendarEvents.map((event) => (
                                <div key={event.id} className="admin-project-item">
                                    <div className="admin-project-image">
                                        <div className="admin-image-placeholder">
                                            {formatStartAt(event.start_at)}
                                        </div>
                                    </div>
                                    <div className="admin-project-info">
                                        <h3 className="admin-project-title">{event.title}</h3>
                                        <p className="admin-project-desc">{event.organizer_department}</p>
                                    </div>
                                    <div className="admin-project-status">
                                        <span className="admin-badge admin-badge-success">Scheduled</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="admin-empty-state">
                                <p>No calendar events yet</p>
                                <Link href="/admin/calendar-events" className="admin-button-primary">
                                    Create Event
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-card admin-actions-section">
                    <h2 className="admin-card-title">Quick Actions</h2>

                    <div className="admin-action-list">
                        <Link href="/admin/calendar-events" className="admin-action-item">
                            <span>Calendar Events</span>
                        </Link>

                        <Link href="/admin/news" className="admin-action-item">
                            <span>Manage News</span>
                        </Link>

                        <Link href="/admin/team-members" className="admin-action-item">
                            <span>Team Members</span>
                        </Link>

                        <Link href="/admin/settings" className="admin-action-item">
                            <span>Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
