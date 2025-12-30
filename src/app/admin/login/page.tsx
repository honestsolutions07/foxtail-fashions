'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check (change this to your desired password)
        if (password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            router.push('/admin');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <span className="admin-login-logo">🦊</span>
                    <h1>Foxtail Admin</h1>
                    <p>Enter password to continue</p>
                </div>

                <form onSubmit={handleLogin} className="admin-login-form">
                    {error && <div className="admin-login-error">{error}</div>}

                    <div className="admin-form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    <button type="submit" className="admin-login-btn">
                        Login
                    </button>
                </form>

                <p className="admin-login-hint">
                    Hint: admin123
                </p>
            </div>
        </div>
    );
}
