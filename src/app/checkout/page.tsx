'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
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

const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fox Coins State
    const [userCoins, setUserCoins] = useState(0);
    const [coinsToRedeem, setCoinsToRedeem] = useState(0);
    const [useCoins, setUseCoins] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadCart();
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.user_metadata?.full_name || '',
                email: user.email || '',
            }));
            // Fetch user's Fox Coins balance
            fetchUserCoins(user.id);
        }
    }, [user]);

    const fetchUserCoins = async (userId: string) => {
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data, error } = await supabase
                .from('profiles')
                .select('fox_coins')
                .eq('id', userId);

            if (!error && data && data.length > 0) {
                setUserCoins(data[0].fox_coins || 0);
            }
        } catch (error) {
            console.error('Error fetching coins:', error);
        }
    };

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            router.push('/cart');
            return;
        }
        setCartItems(cart);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit mobile number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Please enter a valid 6-digit PIN code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // Import supabase dynamically
            const { supabase } = await import('@/lib/supabase');

            // Generate order ID
            const orderId = 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

            // Prepare order items
            const orderItems = cartItems.map(item => ({
                product_id: item.productId,
                product_name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                isCustom: item.isCustom || false,
                customData: item.customData || null,
            }));

            // Calculate coins to be earned (1 coin per ₹100 spent on products, excluding shipping)
            const coinsEarned = Math.floor(subtotal / 100);
            const actualCoinsRedeemed = useCoins ? coinsToRedeem : 0;
            const finalTotal = useCoins ? (subtotal + shipping - coinsToRedeem) : (subtotal + shipping);

            // Create order in Supabase
            const { error } = await supabase.from('orders').insert({
                id: orderId,
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                landmark: formData.landmark || null,
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                total: finalTotal,
                status: 'pending',
                payment_status: 'pending',
                coins_redeemed: actualCoinsRedeemed,
                coins_earned: coinsEarned,
                coins_credited: false,
            });

            if (error) {
                console.error('Order creation error:', error);
                throw error;
            }

            // If coins were redeemed, deduct from user's balance
            if (actualCoinsRedeemed > 0 && user) {
                try {
                    // Update profile
                    await supabase
                        .from('profiles')
                        .update({ fox_coins: userCoins - actualCoinsRedeemed })
                        .eq('id', user.id);

                    // Log transaction
                    await supabase.from('coin_transactions').insert({
                        user_id: user.id,
                        amount: -actualCoinsRedeemed,
                        type: 'redeemed',
                        order_id: orderId,
                        description: `Redeemed ${actualCoinsRedeemed} coins on order ${orderId}`,
                    });
                } catch (coinError) {
                    console.error('Coin redemption error (non-blocking):', coinError);
                }
            }

            // Store order data for confirmation page
            const lastOrder = {
                orderId,
                customer: formData,
                items: cartItems.map(item => ({
                    name: item.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                })),
                total,
            };
            localStorage.setItem('lastOrder', JSON.stringify(lastOrder));

            // Clear cart
            localStorage.setItem('cart', JSON.stringify([]));
            window.dispatchEvent(new Event('cartUpdated'));

            // Navigate to confirmation page
            router.push('/order-confirmation');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const coinsDiscount = useCoins ? coinsToRedeem : 0;
    const total = subtotal + shipping - coinsDiscount;
    const coinsToEarn = Math.floor(subtotal / 100); // 1 coin per ₹100

    // Max coins usable (can't exceed subtotal, and can't use more than user has)
    const maxRedeemableCoins = Math.min(userCoins, subtotal);

    const handleCoinsChange = (value: number) => {
        const validValue = Math.max(0, Math.min(value, maxRedeemableCoins));
        setCoinsToRedeem(validValue);
    };

    if (loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="checkout-page">
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
            <main className="checkout-page">
                <div className="container">
                    <div className="checkout-header">
                        <Link href="/cart" className="checkout-back">← Back to Cart</Link>
                        <h1>Checkout</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="checkout-layout">
                        {/* Shipping Details */}
                        <div className="checkout-form">
                            <div className="checkout-section">
                                <h2>📍 Shipping Address</h2>
                                <p className="checkout-section-note">We deliver all across India</p>

                                <div className="checkout-form-grid">
                                    <div className="checkout-form-group full-width">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <div className="phone-input">
                                            <span className="phone-prefix">+91</span>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                className={errors.phone ? 'error' : ''}
                                            />
                                        </div>
                                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    </div>

                                    <div className="checkout-form-group full-width">
                                        <label htmlFor="address">Street Address *</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House/Flat No., Building Name, Street, Area"
                                            rows={3}
                                            className={errors.address ? 'error' : ''}
                                        />
                                        {errors.address && <span className="error-text">{errors.address}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Enter city"
                                            className={errors.city ? 'error' : ''}
                                        />
                                        {errors.city && <span className="error-text">{errors.city}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="state">State *</label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={errors.state ? 'error' : ''}
                                        >
                                            <option value="">Select State</option>
                                            {indianStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.state && <span className="error-text">{errors.state}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="pincode">PIN Code *</label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="6-digit PIN code"
                                            maxLength={6}
                                            className={errors.pincode ? 'error' : ''}
                                        />
                                        {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="landmark">Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            id="landmark"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            placeholder="Near, opposite to..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="checkout-summary">
                            <h2>Order Summary</h2>

                            <div className="checkout-items">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="checkout-item">
                                        <div className="checkout-item-image">
                                            <Image
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <span className="checkout-item-qty">{item.quantity}</span>
                                        </div>
                                        <div className="checkout-item-info">
                                            <p className="checkout-item-name">{item.name}</p>
                                            <p className="checkout-item-size">Size: {item.size}</p>
                                        </div>
                                        <p className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="checkout-summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free-shipping' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>

                            {/* Fox Coins Section */}
                            {user && userCoins > 0 && (
                                <div className="fox-coins-section">
                                    <div className="fox-coins-header">
                                        <label className="fox-coins-toggle">
                                            <input
                                                type="checkbox"
                                                checked={useCoins}
                                                onChange={(e) => {
                                                    setUseCoins(e.target.checked);
                                                    if (e.target.checked) {
                                                        setCoinsToRedeem(maxRedeemableCoins);
                                                    } else {
                                                        setCoinsToRedeem(0);
                                                    }
                                                }}
                                            />
                                            <span className="fox-coins-label">🦊 Use Fox Coins</span>
                                        </label>
                                        <span className="fox-coins-balance">{userCoins} coins available</span>
                                    </div>
                                    {useCoins && (
                                        <div className="fox-coins-input-wrapper">
                                            <input
                                                type="number"
                                                value={coinsToRedeem}
                                                onChange={(e) => handleCoinsChange(Number(e.target.value))}
                                                min={0}
                                                max={maxRedeemableCoins}
                                                className="fox-coins-input"
                                            />
                                            <span className="fox-coins-max">Max: {maxRedeemableCoins}</span>
                                            <p className="fox-coins-value">= ₹{coinsToRedeem} discount</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {coinsDiscount > 0 && (
                                <div className="checkout-summary-row fox-coins-discount">
                                    <span>🦊 Coins Discount</span>
                                    <span>-₹{coinsDiscount}</span>
                                </div>
                            )}

                            {/* Coins to be earned */}
                            {coinsToEarn > 0 && (
                                <div className="coins-earn-info">
                                    <span>🎉 You will earn <strong>{coinsToEarn} Fox Coins</strong> from this order!</span>
                                </div>
                            )}

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-row checkout-total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>

                            <button
                                type="submit"
                                className="checkout-pay-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Processing...' : `Proceed to Pay ₹${total.toLocaleString('en-IN')}`}
                            </button>

                            <div className="checkout-secure">
                                <span>🔒</span>
                                <p>Your payment information is secure. We use SSL encryption to protect your data.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
