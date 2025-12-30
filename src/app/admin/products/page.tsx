'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', 'men', 'women', 'kids', 'accessories'];

    return (
        <div className="admin-products-page">
            {/* Header */}
            <div className="admin-page-header">
                <div className="admin-page-filters">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="admin-filter-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <Link href="/admin/products/add" className="admin-btn-primary">
                    ➕ Add Product
                </Link>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="admin-empty-state">
                    <p>Loading products...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                    <p>No products found</p>
                    <Link href="/admin/products/add" className="admin-btn-primary">
                        Add Your First Product
                    </Link>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Subcategory</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="admin-table-image"
                                        />
                                    </td>
                                    <td className="admin-table-name">{product.name}</td>
                                    <td>
                                        <span className="admin-badge">{product.category}</span>
                                    </td>
                                    <td>{product.subcategory}</td>
                                    <td className="admin-table-price">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td>
                                        <div className="admin-table-actions">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="admin-btn-edit"
                                            >
                                                ✏️
                                            </Link>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="admin-btn-delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
