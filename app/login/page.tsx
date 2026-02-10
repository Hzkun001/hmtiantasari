'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                // Verify session is stored
                await supabase.auth.getSession();

                // Use window.location for hard redirect to ensure cookies are set
                window.location.href = '/admin';
            } else {
                setError('Login successful but no session created');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-wrapper">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <span>A</span>
                    </div>
                    <h1 className="login-title">HMTI Admin</h1>
                    <p className="login-subtitle">Dashboard Administration</p>
                </div>

                {/* Login Card */}
                <div className="login-card">
                    <h2 className="login-card-title">Sign In</h2>

                    {error && (
                        <div className="login-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-form-group">
                            <label className="login-form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-form-input"
                                placeholder="admin@gmail.com"
                                required
                            />
                        </div>

                        <div className="login-form-group">
                            <label className="login-form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p className="login-footer-text">
                            Powered by HMTI UIN Antasari
                        </p>
                    </div>
                </div>

                <div className="login-help">
                    <p className="login-help-text">
                        Need access? Contact your administrator
                    </p>
                </div>
            </div>
        </div>
    );
}
