'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface ReplacementRequest {
    id: string;
    order_id: string;
    user_id: string;
    reason: string;
    description?: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    items: { product_name: string; size: string; quantity: number }[];
    total: number;
}

export default function AdminReplacementsPage() {
    const [requests, setRequests] = useState<ReplacementRequest[]>([]);
    const [orders, setOrders] = useState<{ [id: string]: Order }>({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<ReplacementRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('replacement_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);

            // Fetch related orders
            if (data && data.length > 0) {
                const orderIds = [...new Set(data.map((r: ReplacementRequest) => r.order_id))];
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('id, customer_name, customer_email, customer_phone, items, total')
                    .in('id', orderIds);

                if (ordersData) {
                    const orderMap: { [id: string]: Order } = {};
                    ordersData.forEach((o: Order) => {
                        orderMap[o.id] = o;
                    });
                    setOrders(orderMap);
                }
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (requestId: string, newStatus: string) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('replacement_requests')
                .update({
                    status: newStatus,
                    admin_notes: adminNotes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', requestId);

            if (error) throw error;

            fetchRequests();
            setSelectedRequest(null);
            setAdminNotes('');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const filteredRequests = filterStatus === 'all'
        ? requests
        : requests.filter(r => r.status === filterStatus);

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: { bg: string; color: string } } = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            approved: { bg: '#d1fae5', color: '#065f46' },
            rejected: { bg: '#fee2e2', color: '#991b1b' },
            completed: { bg: '#dbeafe', color: '#1e40af' },
        };
        const style = styles[status] || styles.pending;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: style.bg,
                color: style.color,
            }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Replacement Requests</h1>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Reason</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((req) => {
                            const order = orders[req.order_id];
                            return (
                                <tr key={req.id}>
                                    <td><strong>{req.order_id}</strong></td>
                                    <td>{order?.customer_name || 'N/A'}</td>
                                    <td>{req.reason}</td>
                                    <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setAdminNotes(req.admin_notes || '');
                                            }}
                                            className="action-btn edit-btn"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No replacement requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Request Details</h2>

                        <div className="detail-section">
                            <h4>Order Info</h4>
                            <p><strong>Order ID:</strong> {selectedRequest.order_id}</p>
                            <p><strong>Customer:</strong> {orders[selectedRequest.order_id]?.customer_name}</p>
                            <p><strong>Email:</strong> {orders[selectedRequest.order_id]?.customer_email}</p>
                            <p><strong>Phone:</strong> {orders[selectedRequest.order_id]?.customer_phone}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Replacement Reason</h4>
                            <p><strong>{selectedRequest.reason}</strong></p>
                            {selectedRequest.description && (
                                <p style={{ color: '#6b7280' }}>{selectedRequest.description}</p>
                            )}
                        </div>

                        {selectedRequest.images && selectedRequest.images.length > 0 && (
                            <div className="detail-section">
                                <h4>Uploaded Images</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedRequest.images.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={img}
                                                alt={`Evidence ${idx + 1}`}
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="detail-section">
                            <h4>Admin Notes</h4>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes for the customer..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                        </div>

                        <div className="modal-actions">
                            {selectedRequest.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                                        disabled={updating}
                                        className="btn-secondary"
                                        style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'approved')}
                                        disabled={updating}
                                        className="btn-primary"
                                        style={{ background: '#10b981' }}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                            {selectedRequest.status === 'approved' && (
                                <button
                                    onClick={() => updateStatus(selectedRequest.id, 'completed')}
                                    disabled={updating}
                                    className="btn-primary"
                                >
                                    Mark as Completed
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
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
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
                .admin-table tr:hover {
                    background: #f9fafb;
                }
                .action-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .edit-btn {
                    background: #f3f4f6;
                    color: #374151;
                }
                .edit-btn:hover {
                    background: #e5e7eb;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-content h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }
                .detail-section {
                    margin-bottom: 1.5rem;
                }
                .detail-section h4 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    flex-wrap: wrap;
                }
                .btn-primary {
                    background: #000;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-secondary {
                    background: white;
                    color: #374151;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    border: 1px solid #d1d5db;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
