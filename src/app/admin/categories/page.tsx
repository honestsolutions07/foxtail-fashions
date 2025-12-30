'use client';

import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
    created_at: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch categories from Supabase
    useEffect(() => {
        fetchCategories();
    }, []);

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
            setLoading(false);
        }
    };

    const addSubcategory = async (categoryId: string) => {
        if (!newSubcategory.trim()) return;

        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        // Check if subcategory already exists
        if (category.subcategories.includes(newSubcategory.trim())) {
            alert('This subcategory already exists!');
            return;
        }

        setSaving(true);
        try {
            const updatedSubcategories = [...category.subcategories, newSubcategory.trim()];

            const { data, error } = await supabaseAdmin
                .from('categories')
                .update({ subcategories: updatedSubcategories })
                .eq('id', categoryId)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                alert('Failed to update: No rows were updated. Check database permissions.');
                return;
            }

            // Update local state
            setCategories(prev => prev.map(cat =>
                cat.id === categoryId ? { ...cat, subcategories: updatedSubcategories } : cat
            ));

            setNewSubcategory('');
            setEditingCategory(null);
            alert('Subcategory added successfully!');
        } catch (error) {
            console.error('Error adding subcategory:', error);
            alert('Failed to add subcategory. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    const removeSubcategory = async (categoryId: string, subcategory: string) => {
        if (!confirm(`Remove "${subcategory}" from this category?`)) return;

        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        setSaving(true);
        try {
            const updatedSubcategories = category.subcategories.filter(sub => sub !== subcategory);

            const { data, error } = await supabaseAdmin
                .from('categories')
                .update({ subcategories: updatedSubcategories })
                .eq('id', categoryId)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                alert('Failed to update: No rows were updated. Check database permissions.');
                return;
            }

            // Update local state
            setCategories(prev => prev.map(cat =>
                cat.id === categoryId ? { ...cat, subcategories: updatedSubcategories } : cat
            ));

            alert('Subcategory removed!');
        } catch (error) {
            console.error('Error removing subcategory:', error);
            alert('Failed to remove subcategory. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-categories-page">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-categories-page">
            <div className="admin-page-header">
                <h1>📁 Categories Management</h1>
                <p>Manage your product categories and subcategories</p>
            </div>

            <div className="admin-categories-grid">
                {categories.map((category) => (
                    <div key={category.id} className="admin-category-card">
                        <div className="admin-category-header">
                            <h3>{category.name}</h3>
                            <span className="admin-category-count">
                                {category.subcategories?.length || 0} subcategories
                            </span>
                        </div>

                        <div className="admin-subcategories-list">
                            {category.subcategories?.map((sub) => (
                                <div key={sub} className="admin-subcategory-item">
                                    <span>{sub}</span>
                                    <button
                                        onClick={() => removeSubcategory(category.id, sub)}
                                        className="admin-subcategory-remove"
                                        disabled={saving}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {editingCategory === category.id ? (
                            <div className="admin-add-subcategory">
                                <input
                                    type="text"
                                    value={newSubcategory}
                                    onChange={(e) => setNewSubcategory(e.target.value)}
                                    placeholder="New subcategory name"
                                    className="admin-subcategory-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addSubcategory(category.id);
                                    }}
                                />
                                <div className="admin-subcategory-actions">
                                    <button
                                        onClick={() => addSubcategory(category.id)}
                                        className="admin-btn-small-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Add'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setNewSubcategory('');
                                        }}
                                        className="admin-btn-small-secondary"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditingCategory(category.id)}
                                className="admin-add-btn"
                            >
                                + Add Subcategory
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="admin-empty-state">
                    <span>📭</span>
                    <p>No categories found in the database</p>
                </div>
            )}
        </div>
    );
}
