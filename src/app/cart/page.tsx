'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        setLoading(false);
    };

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        const newCart = [...cartItems];
        newCart[index].quantity = newQuantity;
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (index: number) => {
        const newCart = cartItems.filter((_, i) => i !== index);
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('cart', JSON.stringify([]));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 899 ? 0 : 99;
    const total = subtotal + shipping;

    if (loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="cart-page">
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
            <main className="cart-page">
                <div className="container">
                    <div className="cart-header">
                        <h1>Shopping Cart</h1>
                        <span className="cart-count">{cartItems.length} items</span>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <div className="cart-empty-icon">🛒</div>
                            <h2>Your cart is empty</h2>
                            <p>Looks like you haven't added anything to your cart yet</p>
                            <Link href="/" className="cart-shop-btn">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="cart-layout">
                            {/* Cart Items */}
                            <div className="cart-items">
                                {cartItems.map((item, index) => (
                                    <div key={`${item.productId}-${item.size}`} className={`cart-item ${item.isCustom ? 'custom-cart-item' : ''}`}>
                                        <div className="cart-item-image">
                                            <img
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="cart-item-details">
                                            {item.isCustom && (
                                                <span className="custom-item-badge">🎨 Custom Order</span>
                                            )}
                                            <span className="cart-item-name">
                                                {item.name}
                                            </span>
                                            {item.size && item.size !== 'One Size' && (
                                                <p className="cart-item-size">Size: {item.size}</p>
                                            )}
                                            {item.isCustom && item.customData && (
                                                <p className="cart-item-color">
                                                    Color: <span style={{ backgroundColor: item.customData.color, display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', marginRight: '6px', verticalAlign: 'middle', border: '1px solid #ccc' }}></span>
                                                    {item.customData.color_name}
                                                </p>
                                            )}
                                            <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>

                                            <div className="cart-item-actions">
                                                <div className="cart-quantity">
                                                    <button onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                                                </div>
                                                <button className="cart-remove-btn" onClick={() => removeItem(index)}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <div className="cart-item-total">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}

                                <button className="cart-clear-btn" onClick={clearCart}>
                                    Clear Cart
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="cart-summary">
                                <h2>Order Summary</h2>

                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="cart-summary-row">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>

                                {shipping > 0 && (
                                    <p className="cart-free-shipping-note">
                                        Add ₹{(900 - subtotal).toLocaleString('en-IN')} more for free shipping
                                    </p>
                                )}

                                {/* First Order Hint */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    
                                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                                        First order? Use code <span style={{ fontWeight: '700', background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>FOFA</span> for FREE shipping above ₹499!
                                    </p>
                                </div>

                                <div className="cart-summary-divider"></div>

                                <div className="cart-summary-row cart-total">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>

                                <Link href="/checkout" className="cart-checkout-btn">
                                    Proceed to Checkout
                                </Link>

                                <div className="cart-secure-note">
                                    🔒 Secure checkout powered by Razorpay
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
