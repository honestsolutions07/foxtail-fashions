'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        } else if (pathname !== '/admin/login') {
            router.push('/admin/login');
        }
        setIsLoading(false);
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        router.push('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: '📊' },
        { name: 'Products', href: '/admin/products', icon: '📦' },
        { name: 'Categories', href: '/admin/categories', icon: '📁' },
        { name: 'Orders', href: '/admin/orders', icon: '🛒' },
        { name: 'Replacements', href: '/admin/replacements', icon: '🔄' },
        { name: 'Ads', href: '/admin/ads', icon: '📢' },
        { name: 'T-Shirt Colors', href: '/admin/colors', icon: '🎨' },
        { name: 'Custom Pricing', href: '/admin/pricing', icon: '💰' },
        { name: 'Coupons', href: '/admin/coupons', icon: '🎫' },
    ];

    if (isLoading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
            </div>
        );
    }

    // Show login page without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="admin-container">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px' }} />
                        Foxtail Admin
                    </h2>
                    <button
                        className="admin-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Header */}
                <header className="admin-header">
                    <button
                        className="admin-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>
                    <h1 className="admin-page-title">
                        {navItems.find(item => item.href === pathname)?.name || 'Admin'}
                    </h1>
                    <div className="admin-header-right">
                        <span className="admin-user">👤 Admin</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
