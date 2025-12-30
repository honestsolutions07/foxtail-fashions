'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ReplacementRequest } from '@/lib/supabase';

interface OrderItem {
    product_id: string;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    shipping_address: string;
    city: string;
    state: string;
    pincode: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: string;
    cancel_reason?: string;
    tracking_id?: string;
    delivered_at?: string;
    created_at: string;
}

const statusConfig: { [key: string]: { color: string; icon: string; label: string } } = {
    pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
    confirmed: { color: '#3b82f6', icon: '✓', label: 'Confirmed' },
    processing: { color: '#8b5cf6', icon: '📦', label: 'Processing' },
    shipped: { color: '#06b6d4', icon: '🚚', label: 'Shipped' },
    delivered: { color: '#10b981', icon: '✅', label: 'Delivered' },
    cancelled: { color: '#ef4444', icon: '❌', label: 'Cancelled' },
};

export default function UserOrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [replacementRequests, setReplacementRequests] = useState<{ [orderId: string]: ReplacementRequest }>({});

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async (isRefresh = false) => {
        if (!user?.email) return;

        if (isRefresh) setRefreshing(true);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_email', user.email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);

            // Fetch replacement requests for delivered orders
            if (data && user) {
                const { data: requests } = await supabase
                    .from('replacement_requests')
                    .select('*')
                    .eq('user_id', user.id);

                if (requests) {
                    const requestMap: { [orderId: string]: ReplacementRequest } = {};
                    requests.forEach((req: ReplacementRequest) => {
                        requestMap[req.order_id] = req;
                    });
                    setReplacementRequests(requestMap);
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchOrders(true);
    };

    // Check if replacement request is eligible (within 7 days of delivery)
    const isReplacementEligible = (order: Order): boolean => {
        if (order.status !== 'delivered') return false;
        if (!order.delivered_at) {
            // If no delivered_at, check if status changed to delivered within 7 days using created_at as fallback
            const orderDate = new Date(order.created_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }
        const deliveredDate = new Date(order.delivered_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    // Subscribe to real-time updates on orders
    useEffect(() => {
        if (!user?.email) return;

        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_email=eq.${user.email}`,
                },
                (payload) => {
                    // Update the specific order in our local state
                    setOrders(prevOrders =>
                        prevOrders.map(order =>
                            order.id === payload.new.id
                                ? { ...order, ...payload.new }
                                : order
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.email]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusProgress = (status: string) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        return steps.indexOf(status) + 1;
    };

    if (authLoading || loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="user-orders-page">
                    <div className="container">
                        <div className="loading-spinner"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main className="user-orders-page">
                <div className="container">
                    <div className="user-orders-header">
                        <div className="user-orders-title-row">
                            <h1>My Orders</h1>
                            <button
                                className="refresh-orders-btn"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                title="Refresh orders"
                            >
                                {refreshing ? 'Updating...' : 'Refresh Status'}
                            </button>
                        </div>
                        <span className="user-orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="user-orders-empty">
                            <div className="empty-icon">🛍️</div>
                            <h2>No orders yet</h2>
                            <p>Looks like you haven't placed any orders yet</p>
                            <Link href="/" className="start-shopping-btn">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="user-orders-list">
                            {orders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.pending;
                                const isExpanded = expandedOrder === order.id;

                                return (
                                    <div key={order.id} className={`user-order-card ${isExpanded ? 'expanded' : ''}`}>
                                        <div
                                            className="user-order-header"
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        >
                                            <div className="user-order-main-info">
                                                <div className="user-order-id-status">
                                                    <span className="user-order-id">{order.id}</span>
                                                    <span
                                                        className="user-order-status"
                                                        style={{ background: status.color }}
                                                    >
                                                        {status.icon} {status.label}
                                                    </span>
                                                </div>
                                                <p className="user-order-date">Placed on {formatDate(order.created_at)}</p>
                                            </div>
                                            <div className="user-order-summary">
                                                <span className="user-order-total">₹{order.total.toLocaleString('en-IN')}</span>
                                                <span className="user-order-items-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                                <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>▼</span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="user-order-details">
                                                {/* Cancel Reason if cancelled */}
                                                {order.status === 'cancelled' && order.cancel_reason && (
                                                    <div className="user-order-cancel-reason">
                                                        <h4>❌ Order Cancelled</h4>
                                                        <p>{order.cancel_reason}</p>
                                                    </div>
                                                )}

                                                {/* Progress Timeline (only if not cancelled) */}
                                                {order.status !== 'cancelled' && (
                                                    <div className="user-order-progress">
                                                        <div className="progress-bar">
                                                            <div
                                                                className="progress-fill"
                                                                style={{ width: `${(getStatusProgress(order.status) / 5) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="progress-steps">
                                                            {[
                                                                { name: 'Order Placed' },
                                                                { name: 'Confirmed' },
                                                                { name: 'Processing' },
                                                                { name: 'Shipped' },
                                                                { name: 'Delivered', icon: '🎉' }
                                                            ].map((step, idx) => {
                                                                const currentStepIdx = getStatusProgress(order.status) - 1;
                                                                const isCompleted = idx < getStatusProgress(order.status);
                                                                const isCurrent = idx === currentStepIdx;

                                                                return (
                                                                    <div
                                                                        key={step.name}
                                                                        className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                                                    >
                                                                        <div className="step-dot">
                                                                            {!isCompleted && <span className="step-icon">{step.icon}</span>}
                                                                        </div>
                                                                        <span>{step.name}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tracking Info */}
                                                {order.tracking_id && (
                                                    <div className="user-order-tracking">
                                                        <h4>🚚 Tracking Information</h4>
                                                        <p>Tracking ID: <strong>{order.tracking_id}</strong></p>
                                                        <p style={{ marginTop: '8px', fontSize: '14px', color: '#4b5563' }}>
                                                            Track your shipment here:
                                                            <a
                                                                href="https://stcourier.com/track/shipment"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '6px', fontWeight: '500' }}
                                                            >
                                                                Details
                                                            </a>
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Order Items */}
                                                <div className="user-order-items">
                                                    <h4>Items</h4>
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="user-order-item">
                                                            <div className="user-item-image">
                                                                {item.image ? (
                                                                    <Image
                                                                        src={item.image}
                                                                        alt={item.product_name}
                                                                        fill
                                                                        style={{ objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    <span>📦</span>
                                                                )}
                                                            </div>
                                                            <div className="user-item-info">
                                                                <p className="user-item-name">{item.product_name}</p>
                                                                <p className="user-item-meta">Size: {item.size} × {item.quantity}</p>
                                                            </div>
                                                            <p className="user-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Delivery Address */}
                                                <div className="user-order-address">
                                                    <h4>📍 Delivery Address</h4>
                                                    <p>{order.shipping_address}</p>
                                                    <p>{order.city}, {order.state} - {order.pincode}</p>
                                                </div>

                                                {/* Payment Summary */}
                                                <div className="user-order-payment">
                                                    <div className="payment-row">
                                                        <span>Subtotal</span>
                                                        <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="payment-row">
                                                        <span>Shipping</span>
                                                        <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                                    </div>
                                                    <div className="payment-row total">
                                                        <span>Total</span>
                                                        <span>₹{order.total.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>

                                                {/* Replacement Request Section */}
                                                {order.status === 'delivered' && (
                                                    <div className="user-order-replacement">
                                                        {replacementRequests[order.id] ? (
                                                            <div className="replacement-status">
                                                                <h4>🔄 Replacement Request</h4>
                                                                <div className={`replacement-badge ${replacementRequests[order.id].status}`}>
                                                                    {replacementRequests[order.id].status === 'pending' && '⏳ Pending Review'}
                                                                    {replacementRequests[order.id].status === 'approved' && '✅ Approved'}
                                                                    {replacementRequests[order.id].status === 'rejected' && '❌ Rejected'}
                                                                    {replacementRequests[order.id].status === 'completed' && '🎉 Completed'}
                                                                </div>
                                                                {replacementRequests[order.id].admin_notes && (
                                                                    <p className="admin-notes">Admin: {replacementRequests[order.id].admin_notes}</p>
                                                                )}
                                                            </div>
                                                        ) : isReplacementEligible(order) ? (
                                                            <Link
                                                                href={`/replacements/request?orderId=${order.id}`}
                                                                className="request-replacement-btn"
                                                            >
                                                                🔄 Request Replacement
                                                            </Link>
                                                        ) : (
                                                            <p className="replacement-expired">
                                                                Replacement period has expired (7 days from delivery)
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
