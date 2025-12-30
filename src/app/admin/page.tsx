'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        revenue: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData || []);

            // Fetch categories count
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('id');

            // Fetch orders and calculate revenue
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('id, total, status');

            // Calculate total revenue from completed/delivered orders (not cancelled)
            const totalRevenue = ordersData
                ?.filter(order => order.status !== 'cancelled')
                .reduce((sum, order) => sum + (order.total || 0), 0) || 0;

            setStats({
                totalProducts: productsData?.length || 0,
                totalCategories: categoriesData?.length || 0,
                totalOrders: ordersData?.length || 0,
                revenue: totalRevenue,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Total Products', value: stats.totalProducts, icon: '📦', color: '#3b82f6' },
        { title: 'Categories', value: stats.totalCategories, icon: '📁', color: '#10b981' },
        { title: 'Orders', value: stats.totalOrders, icon: '🛒', color: '#f59e0b' },
        { title: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#8b5cf6' },
    ];

    const quickActions = [
        { title: 'Add Product', href: '/admin/products/add', icon: '➕' },
        { title: 'View Products', href: '/admin/products', icon: '📦' },
        { title: 'Manage Categories', href: '/admin/categories', icon: '📁' },
    ];

    return (
        <div className="admin-dashboard">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
                {statCards.map((stat) => (
                    <div key={stat.title} className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="admin-stat-info">
                            <p className="admin-stat-title">{stat.title}</p>
                            <p className="admin-stat-value">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="admin-section">
                <h2 className="admin-section-title">Quick Actions</h2>
                <div className="admin-quick-actions">
                    {quickActions.map((action) => (
                        <Link key={action.title} href={action.href} className="admin-quick-action">
                            <span className="admin-quick-icon">{action.icon}</span>
                            {action.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Products */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">Recent Products</h2>
                    <Link href="/admin/products" className="admin-view-all">View All →</Link>
                </div>

                {loading ? (
                    <div className="admin-empty-state">
                        <p>Loading...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="admin-empty-state">
                        <p>No products yet</p>
                        <Link href="/admin/products/add" className="admin-btn-primary">
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="admin-products-preview">
                        {products.slice(0, 5).map((product) => (
                            <div key={product.id} className="admin-product-row">
                                <img src={product.image} alt={product.name} className="admin-product-thumb" />
                                <div className="admin-product-info">
                                    <p className="admin-product-name">{product.name}</p>
                                    <p className="admin-product-category">{product.category}</p>
                                </div>
                                <p className="admin-product-price">₹{product.price.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
