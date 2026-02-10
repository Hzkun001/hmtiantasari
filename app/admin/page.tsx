'use client';

import { useState, useEffect } from 'react';
import { supabase, Project } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        console.log('Checking auth in admin page...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Admin page session:', session);

        if (!session) {
            console.log('No session, redirecting to login...');
            router.push('/login');
        } else {
            console.log('Session found, loading dashboard...');
            fetchDashboardData();
        }
    }

    async function fetchDashboardData() {
        setLoading(true);

        const { data: projectsData } = await supabase
            .from('Projects')
            .select('*')
            .order('id', { ascending: false })
            .limit(5);

        if (projectsData) {
            setProjects(projectsData);
            setStats({
                totalProjects: projectsData.length,
                activeProjects: projectsData.filter(p => p.image_url).length,
            });
        }

        setLoading(false);
    }

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
            {/* Header */}
            <div className="admin-header-section">
                <div className="admin-dashboard-header">
                    <div className="admin-dashboard-logo" aria-hidden="true">
                        <span>H</span>
                    </div>
                    <div>
                        <h1 className="admin-page-title">Dashboard</h1>
                        <p className="admin-page-subtitle">Overview of your projects and activities</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Total Projects</div>
                    <div className="admin-stat-value">{stats.totalProjects}</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Active Projects</div>
                    <div className="admin-stat-value">{stats.activeProjects}</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Team Members</div>
                    <div className="admin-stat-value">24</div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-label">Completion Rate</div>
                    <div className="admin-stat-value">94%</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content-grid">
                {/* Recent Projects */}
                <div className="admin-card admin-projects-section">
                    <div className="admin-card-header-row">
                        <h2 className="admin-card-title">Recent Projects</h2>
                        <Link href="/admin/projects" className="admin-link-button">
                            View All →
                        </Link>
                    </div>

                    <div className="admin-project-list">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <div key={project.id} className="admin-project-item">
                                    <div className="admin-project-image">
                                        {project.image_url ? (
                                            <Image
                                                src={project.image_url}
                                                alt={project.title}
                                                fill
                                                className="admin-image-cover"
                                            />
                                        ) : (
                                            <div className="admin-image-placeholder">No Image</div>
                                        )}
                                    </div>
                                    <div className="admin-project-info">
                                        <h3 className="admin-project-title">{project.title}</h3>
                                        <p className="admin-project-desc">{project.description}</p>
                                    </div>
                                    <div className="admin-project-status">
                                        {project.image_url ? (
                                            <span className="admin-badge admin-badge-success">Complete</span>
                                        ) : (
                                            <span className="admin-badge admin-badge-warning">Pending</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="admin-empty-state">
                                <p>No projects yet</p>
                                <Link href="/admin/projects" className="admin-button-primary">
                                    Create Project
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-card admin-actions-section">
                    <h2 className="admin-card-title">Quick Actions</h2>

                    <div className="admin-action-list">
                        <Link href="/admin/projects" className="admin-action-item">
                            <span>Manage Projects</span>
                        </Link>

                        <Link href="/admin/activities" className="admin-action-item">
                            <span>View Activities</span>
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
