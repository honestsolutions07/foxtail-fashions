'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface OrderItem {
    product_name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    customer_email: string;
}

const REASONS = [
    'Size Issue',
    'Damaged Product',
    'Wrong Item Received',
    'Quality Issue',
    'Color Mismatch',
    'Other',
];

function ReplacementRequestForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user, loading: authLoading } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (orderId && user) {
            fetchOrder();
        }
    }, [orderId, user, authLoading, router]);

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            // Verify this order belongs to the current user
            if (data.customer_email !== user?.email) {
                alert('Unauthorized access');
                router.push('/orders');
                return;
            }

            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            router.push('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (images.length >= 3) {
            alert('Maximum 3 images allowed');
            return;
        }

        setUploading(true);
        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}_${orderId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('replacements')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(uploadError.message || 'Upload failed');
            }

            const { data } = supabase.storage.from('replacements').getPublicUrl(fileName);
            setImages([...images, data.publicUrl]);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message || 'Unknown error'}. Please ensure the storage bucket is set up.`);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason) {
            alert('Please select a reason');
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('replacement_requests').insert({
                order_id: orderId,
                user_id: user?.id,
                reason: reason,
                description: description,
                images: images,
                status: 'pending',
            });

            if (error) throw error;

            alert('Replacement request submitted successfully!');
            router.push('/orders');
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="replacement-request-page">
                    <div className="container">
                        <div className="loading-spinner"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="replacement-request-page">
                    <div className="container">
                        <p>Order not found</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main className="replacement-request-page">
                <div className="container">
                    <div className="replacement-form-wrapper">
                        <h1>Request Replacement</h1>
                        <p className="order-ref">Order: <strong>{order.id}</strong></p>

                        <form onSubmit={handleSubmit}>
                            {/* Order Summary */}
                            <div className="form-section">
                                <h3>Order Items</h3>
                                <div className="order-items-summary">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="summary-item">
                                            <span>{item.product_name}</span>
                                            <span>Size: {item.size} × {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reason Selection */}
                            <div className="form-section">
                                <label htmlFor="reason">Reason for Replacement *</label>
                                <select
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    {REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="form-section">
                                <label htmlFor="description">Detailed Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe the issue in detail..."
                                    rows={4}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="form-section">
                                <label>Upload Images (Max 3)</label>
                                <div className="image-upload-area">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="uploaded-image">
                                            <img src={img} alt={`Upload ${idx + 1}`} />
                                            <button type="button" onClick={() => removeImage(idx)}>×</button>
                                        </div>
                                    ))}
                                    {images.length < 3 && (
                                        <label className="upload-btn">
                                            {uploading ? 'Uploading...' : '+ Add Image'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="submit-replacement-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Replacement Request'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />

            <style jsx>{`
                .replacement-request-page {
                    min-height: 70vh;
                    padding: 3rem 0;
                    background: #f9fafb;
                }
                .replacement-form-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .order-ref {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }
                .form-section {
                    margin-bottom: 1.5rem;
                }
                .form-section h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: #374151;
                }
                .form-section label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: #374151;
                }
                select, textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                select:focus, textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                }
                .order-items-summary {
                    background: #f3f4f6;
                    border-radius: 8px;
                    padding: 1rem;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 0.9rem;
                }
                .summary-item:last-child {
                    border-bottom: none;
                }
                .image-upload-area {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .uploaded-image {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .uploaded-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .uploaded-image button {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                }
                .upload-btn {
                    width: 80px;
                    height: 80px;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .upload-btn:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }
                .submit-replacement-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .submit-replacement-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                .submit-replacement-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default function ReplacementRequestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReplacementRequestForm />
        </Suspense>
    );
}
