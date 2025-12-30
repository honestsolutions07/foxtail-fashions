'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Product } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        subcategory: '',
        image: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [productId]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId);

            if (error) {
                console.error('Error fetching product:', error);
            }

            if (data && data.length > 0) {
                const product = data[0];
                setFormData({
                    name: product.name,
                    price: product.price.toString(),
                    category: product.category,
                    subcategory: product.subcategory,
                    image: product.image,
                    description: product.description || '',
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setFetching(false);
        }
    };

    // Get current category's subcategories
    const currentCategory = categories.find(c => c.slug === formData.category);
    const currentSubcategories = currentCategory?.subcategories || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'category') {
            // When category changes, reset subcategory to first option
            const newCategory = categories.find(c => c.slug === value);
            setFormData(prev => ({
                ...prev,
                category: value,
                subcategory: newCategory?.subcategories?.[0] || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    subcategory: formData.subcategory,
                    image: formData.image,
                    description: formData.description,
                })
                .eq('id', productId);

            if (error) throw error;

            router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="admin-form-page">
                <p>Loading product...</p>
            </div>
        );
    }

    return (
        <div className="admin-form-page">
            <div className="admin-form-header">
                <button onClick={() => router.back()} className="admin-back-btn">
                    ← Back
                </button>
                <h2>Edit Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label htmlFor="name">Product Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="price">Price (₹) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            min="0"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={categoriesLoading}
                        >
                            {categoriesLoading ? (
                                <option value="">Loading categories...</option>
                            ) : categories.length === 0 ? (
                                <option value="">No categories found</option>
                            ) : (
                                categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="subcategory">Subcategory *</label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleChange}
                            required
                            disabled={categoriesLoading || currentSubcategories.length === 0}
                        >
                            {currentSubcategories.length === 0 ? (
                                <option value="">No subcategories</option>
                            ) : (
                                currentSubcategories.map((sub: string) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="admin-form-group full-width">
                        <label htmlFor="image">Image URL</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="admin-form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="admin-btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

