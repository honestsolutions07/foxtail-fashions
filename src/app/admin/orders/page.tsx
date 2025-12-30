'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface OrderItem {
    product_id: string;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
    isCustom?: boolean;
    customData?: {
        type: string;
        color: string;
        color_name: string;
        men_size?: string;
        women_size?: string;
        front_image_men?: string;
        back_image_men?: string;
        front_image_women?: string;
        back_image_women?: string;
    };
}

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: string;
    payment_status: string;
    cancel_reason?: string;
    tracking_id?: string;
    created_at: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: '#3b82f6', icon: '✓' },
    { value: 'processing', label: 'Processing', color: '#8b5cf6', icon: '📦' },
    { value: 'shipped', label: 'Shipped', color: '#06b6d4', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#10b981', icon: '✅' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: '❌' },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [updating, setUpdating] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string, reason?: string, trackingIdVal?: string) => {
        setUpdating(true);
        try {
            const updateData: any = { status: newStatus };
            if (reason) {
                updateData.cancel_reason = reason;
            }
            if (trackingIdVal) {
                updateData.tracking_id = trackingIdVal;
            }

            console.log('Updating order:', orderId, 'to status:', newStatus);

            // Use supabaseAdmin to bypass RLS for admin operations
            // Use .select() to get the updated row back and verify the update worked
            const { data, error } = await supabaseAdmin
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            // Check if any row was actually updated
            if (!data || data.length === 0) {
                console.error('No rows updated - check RLS policies or order ID');
                alert('Failed to update: No rows were updated. This may be a permissions issue.');
                return;
            }

            console.log('Update successful:', data);

            // Credit Fox Coins when order is delivered
            if (newStatus === 'delivered') {
                const order = data[0];
                if (order.coins_earned > 0 && !order.coins_credited) {
                    await creditFoxCoins(order);
                }
            }

            // Use functional update to avoid stale closure issue
            setOrders(prevOrders => prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus, cancel_reason: reason, tracking_id: trackingIdVal || order.tracking_id } : order
            ));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus, cancel_reason: reason, tracking_id: trackingIdVal || selectedOrder.tracking_id });
            }

            setShowCancelModal(false);
            setCancelReason('');
            setTrackingId('');

            alert('Order status updated successfully!');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Check console for details.');
        } finally {
            setUpdating(false);
        }
    };

    // Function to credit Fox Coins to user
    const creditFoxCoins = async (order: any) => {
        try {
            // Find user by email
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('email', order.customer_email);

            if (profiles && profiles.length > 0) {
                const profile = profiles[0];
                const newBalance = (profile.fox_coins || 0) + order.coins_earned;

                // Update profile with new coin balance
                await supabaseAdmin
                    .from('profiles')
                    .update({ fox_coins: newBalance, updated_at: new Date().toISOString() })
                    .eq('id', profile.id);

                // Log the transaction
                await supabaseAdmin.from('coin_transactions').insert({
                    user_id: profile.id,
                    amount: order.coins_earned,
                    type: 'earned',
                    order_id: order.id,
                    description: `Earned ${order.coins_earned} coins from order ${order.id}`,
                });

                // Mark order as coins credited
                await supabaseAdmin
                    .from('orders')
                    .update({ coins_credited: true })
                    .eq('id', order.id);

                console.log(`Credited ${order.coins_earned} Fox Coins to ${order.customer_email}`);
            }
        } catch (error) {
            console.error('Error crediting Fox Coins:', error);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (!selectedOrder) return;

        if (newStatus === 'cancelled') {
            setShowCancelModal(true);
        } else {
            // Set pending status instead of immediately updating
            setPendingStatus(newStatus);
        }
    };

    const handleSaveStatus = () => {
        if (!selectedOrder || !pendingStatus) return;

        if (pendingStatus === 'shipped' && !trackingId.trim()) {
            alert('Please enter a Tracking ID for shipped orders');
            return;
        }

        updateOrderStatus(selectedOrder.id, pendingStatus, undefined, trackingId);
        setPendingStatus(null);
    };

    const handleCancelConfirm = () => {
        if (!selectedOrder || !cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        updateOrderStatus(selectedOrder.id, 'cancelled', cancelReason);
    };

    const getStatusInfo = (status: string) => {
        return statusOptions.find(s => s.value === status) || statusOptions[0];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Header with Stats */}
            <div className="admin-orders-header">
                <h1>📦 Orders Management</h1>
                <div className="admin-orders-stats">
                    <div className="stat-card">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card processing">
                        <span className="stat-value">{stats.processing}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                    <div className="stat-card completed">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Delivered</span>
                    </div>
                    <div className="stat-card revenue">
                        <span className="stat-value">₹{stats.revenue.toLocaleString('en-IN')}</span>
                        <span className="stat-label">Revenue</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-orders-filters">
                <button
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All ({orders.length})
                </button>
                {statusOptions.map(status => (
                    <button
                        key={status.value}
                        className={`filter-btn ${filterStatus === status.value ? 'active' : ''}`}
                        onClick={() => setFilterStatus(status.value)}
                        style={{ '--status-color': status.color } as React.CSSProperties}
                    >
                        {status.icon} {status.label} ({orders.filter(o => o.status === status.value).length})
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="admin-orders-empty">
                    <span>📭</span>
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="admin-orders-grid">
                    {/* Orders List */}
                    <div className="orders-list-panel">
                        <h3>Orders ({filteredOrders.length})</h3>
                        <div className="orders-scroll">
                            {filteredOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <div
                                        key={order.id}
                                        className={`order-list-item ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="order-list-header">
                                            <span className="order-list-id">{order.id}</span>
                                            <span
                                                className="order-list-status"
                                                style={{ background: statusInfo.color }}
                                            >
                                                {statusInfo.icon} {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="order-list-customer">
                                            <strong>{order.customer_name}</strong>
                                            <span>{order.items.length} item(s)</span>
                                        </div>
                                        <div className="order-list-footer">
                                            <span className="order-list-amount">₹{order.total.toLocaleString('en-IN')}</span>
                                            <span className="order-list-date">{formatDate(order.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Details Panel */}
                    <div className="order-details-panel">
                        {selectedOrder ? (
                            <>
                                <div className="order-details-header">
                                    <div>
                                        <h2>Order {selectedOrder.id}</h2>
                                        <p>{formatDate(selectedOrder.created_at)}</p>
                                        {selectedOrder.tracking_id && (
                                            <p className="tracking-id-display">
                                                🔖 Tracking ID: <strong>{selectedOrder.tracking_id}</strong>
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        className="current-status-badge"
                                        style={{ background: getStatusInfo(selectedOrder.status).color }}
                                    >
                                        {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).label}
                                    </div>
                                </div>

                                {/* Status Update Section */}
                                <div className="status-update-section">
                                    <h4>Update Status</h4>
                                    <div className="status-buttons">
                                        {statusOptions.map(status => (
                                            <button
                                                key={status.value}
                                                className={`status-btn ${(pendingStatus || selectedOrder.status) === status.value ? 'active' : ''}`}
                                                style={{ '--btn-color': status.color } as React.CSSProperties}
                                                onClick={() => handleStatusChange(status.value)}
                                                disabled={updating}
                                            >
                                                {status.icon} {status.label}
                                            </button>
                                        ))}
                                    </div>
                                    {pendingStatus && pendingStatus !== selectedOrder.status && (
                                        <div className="status-save-section">
                                            <p className="status-change-info">
                                                Status will change: <strong>{getStatusInfo(selectedOrder.status).label}</strong> → <strong>{getStatusInfo(pendingStatus).label}</strong>
                                            </p>

                                            {pendingStatus === 'shipped' && (
                                                <div className="tracking-input-container">
                                                    <label>Tracking ID (ST Courier etc)</label>
                                                    <input
                                                        type="text"
                                                        value={trackingId}
                                                        onChange={(e) => setTrackingId(e.target.value)}
                                                        placeholder="Enter Tracking ID..."
                                                        className="tracking-input"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                className="save-status-btn"
                                                onClick={handleSaveStatus}
                                                disabled={updating}
                                            >
                                                {updating ? '⏳ Saving...' : '💾 Save to Database'}
                                            </button>
                                            <button
                                                className="cancel-change-btn"
                                                onClick={() => setPendingStatus(null)}
                                                disabled={updating}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cancel Reason Display */}
                                {selectedOrder.status === 'cancelled' && selectedOrder.cancel_reason && (
                                    <div className="cancel-reason-display">
                                        <h4>❌ Cancellation Reason</h4>
                                        <p>{selectedOrder.cancel_reason}</p>
                                    </div>
                                )}

                                {/* Customer Info */}
                                <div className="order-section">
                                    <h4>👤 Customer Details</h4>
                                    <div className="customer-info">
                                        <p><strong>{selectedOrder.customer_name}</strong></p>
                                        <p>📧 {selectedOrder.customer_email}</p>
                                        <p>📱 +91 {selectedOrder.customer_phone}</p>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="order-section">
                                    <h4>📍 Shipping Address</h4>
                                    <div className="address-info">
                                        <p>{selectedOrder.shipping_address}</p>
                                        <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                                        {selectedOrder.landmark && <p>Landmark: {selectedOrder.landmark}</p>}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="order-section">
                                    <h4>📦 Items ({selectedOrder.items.length})</h4>
                                    <div className="order-items-list">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className={`order-item-row ${item.isCustom ? 'custom-order-item' : ''}`}>
                                                {item.isCustom && item.customData ? (
                                                    /* Custom Order Display */
                                                    <div className="custom-order-display">
                                                        <div className="custom-order-header">
                                                            <span className="custom-badge">🎨 CUSTOM ORDER</span>
                                                            <span className="custom-type">{item.product_name}</span>
                                                        </div>

                                                        <div className="custom-order-info">
                                                            <div className="info-row">
                                                                <span className="info-label">T-Shirt Color:</span>
                                                                <span className="info-value">
                                                                    <span className="color-dot" style={{ backgroundColor: item.customData.color }}></span>
                                                                    {item.customData.color_name}
                                                                </span>
                                                            </div>
                                                            {item.customData.men_size && (
                                                                <div className="info-row">
                                                                    <span className="info-label">Men's Size:</span>
                                                                    <span className="info-value">{item.customData.men_size}</span>
                                                                </div>
                                                            )}
                                                            {item.customData.women_size && (
                                                                <div className="info-row">
                                                                    <span className="info-label">Women's Size:</span>
                                                                    <span className="info-value">{item.customData.women_size}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Print Images */}
                                                        {(item.customData.front_image_men || item.customData.back_image_men) && (
                                                            <div className="print-images-section">
                                                                <h5>👨 Men's T-Shirt Print Images</h5>
                                                                <div className="print-images-grid">
                                                                    {item.customData.front_image_men && (
                                                                        <div className="print-image-box">
                                                                            <span className="print-label">FRONT</span>
                                                                            <a href={item.customData.front_image_men} target="_blank" rel="noopener noreferrer">
                                                                                <img src={item.customData.front_image_men} alt="Front Men" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {item.customData.back_image_men && (
                                                                        <div className="print-image-box">
                                                                            <span className="print-label">BACK</span>
                                                                            <a href={item.customData.back_image_men} target="_blank" rel="noopener noreferrer">
                                                                                <img src={item.customData.back_image_men} alt="Back Men" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(item.customData.front_image_women || item.customData.back_image_women) && (
                                                            <div className="print-images-section">
                                                                <h5>👩 Women's T-Shirt Print Images</h5>
                                                                <div className="print-images-grid">
                                                                    {item.customData.front_image_women && (
                                                                        <div className="print-image-box">
                                                                            <span className="print-label">FRONT</span>
                                                                            <a href={item.customData.front_image_women} target="_blank" rel="noopener noreferrer">
                                                                                <img src={item.customData.front_image_women} alt="Front Women" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {item.customData.back_image_women && (
                                                                        <div className="print-image-box">
                                                                            <span className="print-label">BACK</span>
                                                                            <a href={item.customData.back_image_women} target="_blank" rel="noopener noreferrer">
                                                                                <img src={item.customData.back_image_women} alt="Back Women" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <p className="item-price custom-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    </div>
                                                ) : (
                                                    /* Regular Order Display */
                                                    <>
                                                        <div className="item-image-large">
                                                            {item.image && (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.product_name}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="item-details">
                                                            <p className="item-name">{item.product_name}</p>
                                                            <p className="item-meta">Size: {item.size} × {item.quantity}</p>
                                                        </div>
                                                        <p className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="order-section payment-summary">
                                    <h4>💰 Payment Summary</h4>
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping</span>
                                        <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total</span>
                                        <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="no-order-selected">
                                <span>👈</span>
                                <p>Select an order to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="cancel-modal" onClick={e => e.stopPropagation()}>
                        <h3>❌ Cancel Order</h3>
                        <p>Please provide a reason for cancellation. This will be visible to the customer.</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            rows={4}
                        />
                        <div className="modal-actions">
                            <button
                                className="modal-btn cancel"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                            >
                                Go Back
                            </button>
                            <button
                                className="modal-btn confirm"
                                onClick={handleCancelConfirm}
                                disabled={updating || !cancelReason.trim()}
                            >
                                {updating ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
