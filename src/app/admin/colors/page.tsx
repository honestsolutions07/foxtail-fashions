'use client';

import { useState, useEffect } from 'react';
import { supabaseAdmin, TshirtColor } from '@/lib/supabase';

export default function AdminColorsPage() {
    const [colors, setColors] = useState<TshirtColor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingColor, setEditingColor] = useState<TshirtColor | null>(null);
    const [formData, setFormData] = useState({ name: '', hex_code: '#000000' });

    useEffect(() => {
        fetchColors();
    }, []);

    const fetchColors = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('tshirt_colors')
                .select('*')
                .order('name');

            if (error) throw error;
            setColors(data || []);
        } catch (error) {
            console.error('Error fetching colors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingColor) {
                // Update existing
                const { error } = await supabaseAdmin
                    .from('tshirt_colors')
                    .update({ name: formData.name, hex_code: formData.hex_code })
                    .eq('id', editingColor.id);

                if (error) throw error;
            } else {
                // Create new
                const { error } = await supabaseAdmin
                    .from('tshirt_colors')
                    .insert({ name: formData.name, hex_code: formData.hex_code, available: true });

                if (error) throw error;
            }

            setFormData({ name: '', hex_code: '#000000' });
            setShowForm(false);
            setEditingColor(null);
            fetchColors();
        } catch (error) {
            console.error('Error saving color:', error);
            alert('Failed to save color');
        }
    };

    const toggleAvailability = async (color: TshirtColor) => {
        try {
            const { error } = await supabaseAdmin
                .from('tshirt_colors')
                .update({ available: !color.available })
                .eq('id', color.id);

            if (error) throw error;
            fetchColors();
        } catch (error) {
            console.error('Error toggling availability:', error);
        }
    };

    const deleteColor = async (id: string) => {
        if (!confirm('Are you sure you want to delete this color?')) return;

        try {
            const { error } = await supabaseAdmin
                .from('tshirt_colors')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchColors();
        } catch (error) {
            console.error('Error deleting color:', error);
        }
    };

    const startEdit = (color: TshirtColor) => {
        setEditingColor(color);
        setFormData({ name: color.name, hex_code: color.hex_code });
        setShowForm(true);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>T-Shirt Colors</h1>
                <button
                    className="admin-btn-primary"
                    onClick={() => {
                        setEditingColor(null);
                        setFormData({ name: '', hex_code: '#000000' });
                        setShowForm(true);
                    }}
                >
                    + Add Color
                </button>
            </div>

            {showForm && (
                <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingColor ? 'Edit Color' : 'Add New Color'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label>Color Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Navy Blue"
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Hex Code</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={formData.hex_code}
                                        onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                        style={{ width: '60px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={formData.hex_code}
                                        onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                        placeholder="#000000"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        required
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn-primary">
                                    {editingColor ? 'Update' : 'Add'} Color
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="admin-loading">Loading colors...</div>
            ) : colors.length === 0 ? (
                <div className="admin-empty">
                    <p>No colors added yet.</p>
                </div>
            ) : (
                <div className="colors-grid">
                    {colors.map((color) => (
                        <div key={color.id} className={`color-card ${!color.available ? 'disabled' : ''}`}>
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: color.hex_code }}
                            />
                            <div className="color-info">
                                <h3>{color.name}</h3>
                                <p>{color.hex_code}</p>
                            </div>
                            <div className="color-actions">
                                <button
                                    className={`toggle-btn ${color.available ? 'active' : ''}`}
                                    onClick={() => toggleAvailability(color)}
                                    title={color.available ? 'Disable' : 'Enable'}
                                >
                                    {color.available ? '✓' : '✗'}
                                </button>
                                <button
                                    className="edit-btn"
                                    onClick={() => startEdit(color)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteColor(color.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
