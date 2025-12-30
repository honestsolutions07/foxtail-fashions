'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderData {
    orderId: string;
    customer: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    items: Array<{
        name: string;
        size: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    total: number;
}

export default function OrderConfirmationPage() {
    const router = useRouter();
    const [orderData, setOrderData] = useState<OrderData | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('lastOrder');
        if (!data) {
            router.push('/');
            return;
        }
        setOrderData(JSON.parse(data));
    }, [router]);

    if (!orderData) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="confirmation-page">
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
            <main className="confirmation-page">
                <div className="container">
                    <div className="confirmation-card">
                        <div className="confirmation-icon">✓</div>
                        <h1>Order Placed Successfully!</h1>
                        <p className="confirmation-id">Order ID: <strong>{orderData.orderId}</strong></p>

                        <div className="confirmation-message">
                            <p>Thank you for your order, <strong>{orderData.customer.fullName}</strong>!</p>
                            <p>We've sent a confirmation email to <strong>{orderData.customer.email}</strong></p>
                        </div>

                        <div className="confirmation-details">
                            <div className="confirmation-section">
                                <h3>📦 Order Summary</h3>
                                <div className="confirmation-items">
                                    {orderData.items.map((item, index) => (
                                        <div key={index} className="confirmation-item">
                                            <div className="confirmation-item-image">
                                                <Image
                                                    src={item.image || '/placeholder.jpg'}
                                                    alt={item.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="confirmation-item-info">
                                                <p className="confirmation-item-name">{item.name}</p>
                                                <p className="confirmation-item-size">Size: {item.size} × {item.quantity}</p>
                                            </div>
                                            <p className="confirmation-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="confirmation-total">
                                    <span>Total Paid</span>
                                    <span>₹{orderData.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="confirmation-section">
                                <h3>📍 Delivery Address</h3>
                                <p>{orderData.customer.address}</p>
                                <p>{orderData.customer.city}, {orderData.customer.state} - {orderData.customer.pincode}</p>
                                <p>Phone: +91 {orderData.customer.phone}</p>
                            </div>
                        </div>

                        <div className="confirmation-timeline">
                            <h3>What happens next?</h3>
                            <div className="timeline-steps">
                                <div className="timeline-step active">
                                    <div className="timeline-dot"></div>
                                    <div>
                                        <strong>Order Confirmed</strong>
                                        <p>We've received your order</p>
                                    </div>
                                </div>
                                <div className="timeline-step">
                                    <div className="timeline-dot"></div>
                                    <div>
                                        <strong>Processing</strong>
                                        <p>Preparing your items</p>
                                    </div>
                                </div>
                                <div className="timeline-step">
                                    <div className="timeline-dot"></div>
                                    <div>
                                        <strong>Shipped</strong>
                                        <p>On the way to you</p>
                                    </div>
                                </div>
                                <div className="timeline-step">
                                    <div className="timeline-dot"></div>
                                    <div>
                                        <strong>Delivered</strong>
                                        <p>Enjoy your purchase!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-actions">
                            <Link href="/orders" className="confirmation-btn-secondary">
                                View My Orders
                            </Link>
                            <Link href="/" className="confirmation-btn-primary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
