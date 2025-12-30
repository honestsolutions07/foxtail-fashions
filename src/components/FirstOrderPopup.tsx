'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function FirstOrderPopup() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkOrders = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            // Check if we've already shown it this session to avoid annoyance
            const hasSeenPopup = sessionStorage.getItem('hasSeenFirstOrderPopup');
            if (hasSeenPopup) {
                setLoading(false);
                return;
            }

            try {
                const { count, error } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('customer_email', user.email);

                if (error) {
                    console.error('Error checking orders:', error);
                    return;
                }

                // If user has 0 orders, show popup
                if (count === 0) {
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('Failed to check order status:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            checkOrders();
        }
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
        // Mark as seen for this session
        sessionStorage.setItem('hasSeenFirstOrderPopup', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="popup-overlay" onClick={handleClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close-btn" onClick={handleClose}>
                    ✕
                </button>
                <div className="popup-image-container">
                    <Image
                        src="/first-order-offer.jpg"
                        alt="First Order Offer"
                        width={500}
                        height={600}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
