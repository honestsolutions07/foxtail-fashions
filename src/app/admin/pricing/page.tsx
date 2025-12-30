'use client';

import { useState, useEffect } from 'react';
import { supabaseAdmin, CustomTshirtPrice } from '@/lib/supabase';

export default function AdminPricingPage() {
    const [prices, setPrices] = useState<CustomTshirtPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('custom_tshirt_prices')
                .select('*')
                .order('id');

            if (error) throw error;
            setPrices(data || []);
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item: CustomTshirtPrice) => {
        setEditingId(item.id);
        setEditPrice(item.price);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditPrice(0);
    };

    const savePrice = async (id: string) => {
        setSaving(true);
        try {
            const { error } = await supabaseAdmin
                .from('custom_tshirt_prices')
                .update({ price: editPrice })
                .eq('id', id);

            if (error) throw error;

            fetchPrices();
            setEditingId(null);
        } catch (error) {
            console.error('Error saving price:', error);
            alert('Failed to save price');
        } finally {
            setSaving(false);
        }
    };

    const getIcon = (id: string) => {
        switch (id) {
            case 'men': return '👨';
            case 'women': return '👩';
            case 'couple': return '💑';
            default: return '👕';
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1>Custom T-Shirt Pricing</h1>
            </div>

            {loading ? (
                <div className="admin-loading">Loading prices...</div>
            ) : prices.length === 0 ? (
                <div className="admin-empty">
                    <p>No pricing data found. Please run the database setup SQL.</p>
                </div>
            ) : (
                <div className="pricing-grid">
                    {prices.map((item) => (
                        <div key={item.id} className="pricing-card">
                            <div className="pricing-icon">{getIcon(item.id)}</div>
                            <h3>{item.title}</h3>

                            {editingId === item.id ? (
                                <div className="pricing-edit">
                                    <div className="price-input-group">
                                        <span>₹</span>
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(Number(e.target.value))}
                                            min="0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="pricing-actions">
                                        <button
                                            className="save-btn"
                                            onClick={() => savePrice(item.id)}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : '✓ Save'}
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={cancelEdit}
                                        >
                                            ✗ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pricing-display">
                                    <div className="current-price">
                                        ₹{item.price.toLocaleString('en-IN')}
                                    </div>
                                    <button
                                        className="edit-price-btn"
                                        onClick={() => startEdit(item)}
                                    >
                                        ✏️ Edit Price
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
