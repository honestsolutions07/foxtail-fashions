'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/lib/supabase';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '0',
        max_discount_amount: '',
        expires_at: '',
        is_active: true,
        usage_limit: '',
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            alert('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const couponData = {
                code: formData.code.toUpperCase().trim(),
                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value),
                min_order_value: Number(formData.min_order_value),
                max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active,
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(couponData)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert([couponData]);
                if (error) throw error;
            }

            fetchCoupons();
            closeModal();
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            alert(error.message || 'Failed to save coupon');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('Failed to delete coupon');
        }
    };

    const openModal = (coupon?: Coupon) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value.toString(),
                min_order_value: coupon.min_order_value.toString(),
                max_discount_amount: coupon.max_discount_amount?.toString() || '',
                expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
                is_active: coupon.is_active,
                usage_limit: coupon.usage_limit?.toString() || '',
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discount_type: 'fixed',
                discount_value: '',
                min_order_value: '0',
                max_discount_amount: '',
                expires_at: '',
                is_active: true,
                usage_limit: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Manage Coupons</h1>
                <button onClick={() => openModal()} className="admin-btn-primary">
                    + Create Coupon
                </button>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Discount</th>
                            <th>Min Order</th>
                            <th>Expiry</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon.id}>
                                <td>
                                    <span className="font-bold text-gray-900">{coupon.code}</span>
                                </td>
                                <td>
                                    {coupon.discount_type === 'free_delivery'
                                        ? '🚚 Free Delivery'
                                        : coupon.discount_type === 'percentage'
                                            ? `${coupon.discount_value}% OFF`
                                            : `₹${coupon.discount_value} OFF`}
                                </td>
                                <td>₹{coupon.min_order_value}</td>
                                <td>
                                    {coupon.expires_at
                                        ? new Date(coupon.expires_at).toLocaleDateString()
                                        : 'No Expiry'}
                                </td>
                                <td>{coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}</td>
                                <td>
                                    <span className={`status-badge ${coupon.is_active ? 'status-active' : 'status-inactive'}`}>
                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => openModal(coupon)} className="action-btn edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(coupon.id)} className="action-btn delete-btn">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No coupons found. Create your first one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Coupon Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                    placeholder="e.g. SUMMER20"
                                    className="uppercase"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    >
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="free_delivery">Free Delivery 🚚</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Value</label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Min Order Value (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.min_order_value}
                                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                        min="0"
                                    />
                                </div>
                                {formData.discount_type === 'percentage' && (
                                    <div className="form-group">
                                        <label>Max Discount Cap (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.max_discount_amount}
                                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    placeholder="Total times can be used"
                                />
                            </div>

                            <div className="form-group">
                                <label>Expires At (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    Is Active?
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Save Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-page {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .admin-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1f2937;
                }
                .admin-table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .admin-table th {
                    background: #f9fafb;
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #4b5563;
                    border-bottom: 1px solid #e5e7eb;
                }
                .admin-table td {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    color: #1f2937;
                    font-size: 0.95rem;
                }
                .admin-table tr:last-child td {
                    border-bottom: none;
                }
                .admin-table tr:hover {
                    background: #f9fafb;
                }
                
                /* Buttons */
                .admin-btn-primary {
                    background: #000;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .admin-btn-primary:hover {
                    background: #333;
                    transform: translateY(-1px);
                }

                .action-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    margin-right: 0.75rem;
                    border: none;
                    transition: all 0.2s;
                }
                .edit-btn {
                    background: #f3f4f6;
                    color: #374151;
                }
                .edit-btn:hover {
                    background: #e5e7eb;
                    color: #111;
                }
                .delete-btn {
                    background: #fee2e2;
                    color: #991b1b;
                    margin-right: 0;
                }
                .delete-btn:hover {
                    background: #fecaca;
                    color: #7f1d1d;
                }

                /* Badges */
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                }
                .status-active { background: #dcfce7; color: #166534; }
                .status-inactive { background: #fee2e2; color: #991b1b; }

                /* Modal */
                .uppercase { text-transform: uppercase; }
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; 
                    padding: 2.5rem; 
                    border-radius: 16px;
                    width: 90%; 
                    max-width: 500px;
                    max-height: 90vh; 
                    overflow-y: auto;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .modal-content h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    color: #111;
                }
                .form-group { margin-bottom: 1.25rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; color: #374151; }
                input, select {
                    width: 100%; 
                    padding: 0.75rem;
                    border: 1px solid #e5e7eb; 
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #000;
                    box-shadow: 0 0 0 1px #000;
                }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; }
                
                .btn-secondary {
                    background: white;
                    color: #374151;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    border: 1px solid #d1d5db;
                    cursor: pointer;
                }
                .btn-secondary:hover { background: #f9fafb; border-color: #9ca3af; }
                
                .btn-primary {
                    background: #000;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                }
                .btn-primary:hover { background: #333; }

                .checkbox-group label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
                .checkbox-group input { width: 1.25rem; height: 1.25rem; accent-color: black; }
            `}</style>
        </div>
    );
}
