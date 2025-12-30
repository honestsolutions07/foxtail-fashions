'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, Product } from '@/lib/supabase';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');

        if (wishlistIds.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('id', wishlistIds);

            if (error) throw error;
            setWishlistItems(data || []);
        } catch (error) {
            console.error('Error loading wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = (productId: string) => {
        const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const newWishlist = wishlistIds.filter((id: string) => id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setWishlistItems(wishlistItems.filter(item => item.id !== productId));
    };

    const addToCart = (product: Product) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item.productId === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || product.image,
                size: 'M', // Default size
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Added to cart!');
    };

    const clearWishlist = () => {
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistItems([]);
    };

    if (loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="wishlist-page">
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
            <main className="wishlist-page">
                <div className="container">
                    <div className="wishlist-header">
                        <h1>My Wishlist</h1>
                        <span className="wishlist-count">{wishlistItems.length} items</span>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="wishlist-empty">
                            <div className="wishlist-empty-icon">❤️</div>
                            <h2>Your wishlist is empty</h2>
                            <p>Save items you love by clicking the heart icon on products</p>
                            <Link href="/" className="wishlist-shop-btn">
                                Explore Products
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="wishlist-actions-bar">
                                <button className="wishlist-clear-btn" onClick={clearWishlist}>
                                    Clear All
                                </button>
                            </div>

                            <div className="wishlist-grid">
                                {wishlistItems.map((item) => (
                                    <div key={item.id} className="wishlist-card">
                                        <Link href={`/product/${item.id}`} className="wishlist-card-image">
                                            <Image
                                                src={item.images?.[0] || item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </Link>

                                        <button
                                            className="wishlist-remove-btn"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            ✕
                                        </button>

                                        <div className="wishlist-card-content">
                                            <Link href={`/product/${item.id}`} className="wishlist-card-name">
                                                {item.name}
                                            </Link>
                                            <p className="wishlist-card-category">{item.subcategory}</p>
                                            <p className="wishlist-card-price">₹{item.price.toLocaleString('en-IN')}</p>

                                            <button
                                                className="wishlist-add-cart-btn"
                                                onClick={() => addToCart(item)}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
