'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { supabase } = await import('@/lib/supabase');
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Check if user is the designated admin
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                if (!adminEmail) {
                    setError('Admin email configuration missing. Please contact support.');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                if (data.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
                    setError('Access denied: You are not an administrator.');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                // Success
                router.push('/admin');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <span className="admin-login-logo">🦊</span>
                    <h1>Foxtail Admin</h1>
                    <p>Secure Login</p>
                </div>

                <form onSubmit={handleLogin} className="admin-login-form">
                    {error && <div className="admin-login-error">{error}</div>}

                    <div className="admin-form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@foxtail.com"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
