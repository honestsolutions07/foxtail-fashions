'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, Product } from '@/lib/supabase';

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        fetchProduct();
        checkWishlist();
    }, [productId]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId);

            if (error) {
                console.error('Error fetching product:', error);
            }
            if (data && data.length > 0) {
                setProduct(data[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(productId));
    };

    const toggleWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        let newWishlist;

        if (wishlist.includes(productId)) {
            newWishlist = wishlist.filter((id: string) => id !== productId);
            setIsWishlisted(false);
        } else {
            newWishlist = [...wishlist, productId];
            setIsWishlisted(true);
        }

        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    };

    const addToCart = () => {
        if (!product) return;

        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) =>
            item.productId === productId && item.size === selectedSize
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || product.image,
                size: selectedSize || 'One Size',
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const getSizes = () => {
        if (!product) return [];
        if (product.size_mode === 'all') return availableSizes;
        if (product.sizes && typeof product.sizes === 'object') {
            return Object.keys(product.sizes);
        }
        return availableSizes;
    };

    const getSizeQuantity = (size: string) => {
        if (!product || product.size_mode === 'all') return null;
        if (product.sizes && typeof product.sizes === 'object') {
            return (product.sizes as any)[size];
        }
        return null;
    };

    const navigateLightbox = (direction: 'prev' | 'next') => {
        if (!product) return;
        const images = product.images?.length ? product.images : [product.image];
        if (direction === 'prev') {
            setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
        } else {
            setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }
    };

    if (loading) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="product-page-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading product...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="product-page-error">
                    <h2>Product not found</h2>
                    <Link href="/" className="btn-primary">Go Home</Link>
                </main>
                <Footer />
            </div>
        );
    }

    const images = product.images?.length ? product.images : [product.image];

    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />

            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>✕</button>
                        {images.length > 1 && (
                            <>
                                <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox('prev')}>‹</button>
                                <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox('next')}>›</button>
                            </>
                        )}
                        <div className="lightbox-image-wrapper">
                            <Image src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} fill style={{ objectFit: 'contain' }} priority />
                        </div>
                        {images.length > 1 && (
                            <div className="lightbox-thumbnails">
                                {images.map((img: string, index: number) => (
                                    <button key={index} className={`lightbox-thumb ${selectedImage === index ? 'active' : ''}`} onClick={() => setSelectedImage(index)}>
                                        <Image src={img} alt={`${product.name} ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="lightbox-counter">{selectedImage + 1} / {images.length}</div>
                    </div>
                </div>
            )}

            <main className="product-page">
                <div className="container">
                    <div className="product-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href={`/category/${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link>
                        <span>/</span>
                        <span>{product.name}</span>
                    </div>

                    <div className="product-layout">
                        <div className="product-images">
                            <div className="product-main-image" onClick={() => setIsLightboxOpen(true)} style={{ cursor: 'zoom-in' }}>
                                <Image src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
                                <div className="zoom-hint">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                    <span>Click to zoom</span>
                                </div>
                            </div>
                            {images.length > 1 && (
                                <div className="product-thumbnails">
                                    {images.map((img: string, index: number) => (
                                        <button key={index} className={`product-thumbnail ${selectedImage === index ? 'active' : ''}`} onClick={() => setSelectedImage(index)}>
                                            <Image src={img} alt={`${product.name} ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="product-info">
                            <div className="product-category-badge">{product.subcategory}</div>
                            <h1 className="product-title">{product.name}</h1>
                            <div className="product-price-section">
                                <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                                <span className="product-price-note">Inclusive of all taxes</span>
                            </div>
                            {product.description && (
                                <div className="product-description">
                                    <h3>Description</h3>
                                    <p>{product.description}</p>
                                </div>
                            )}
                            <div className="product-sizes">
                                <div className="product-sizes-header">
                                    <h3>Select Size</h3>
                                    {product.size_mode === 'all' && <span className="size-availability">Available in all sizes</span>}
                                </div>
                                <div className="product-sizes-grid">
                                    {getSizes().map(size => {
                                        const quantity = getSizeQuantity(size);
                                        const isOutOfStock = quantity !== null && quantity === 0;
                                        return (
                                            <button key={size} className={`product-size-btn ${selectedSize === size ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={() => !isOutOfStock && setSelectedSize(size)} disabled={isOutOfStock}>
                                                {size}
                                                {quantity !== null && quantity > 0 && quantity < 5 && <span className="size-low-stock">Only {quantity} left</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="product-actions">
                                <button className={`product-add-to-cart ${addedToCart ? 'added' : ''}`} onClick={addToCart}>
                                    {addedToCart ? (
                                        <><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Added to Cart</>
                                    ) : (
                                        <><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>Add to Cart</>
                                    )}
                                </button>
                                <button className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={toggleWishlist}>
                                    <svg width="24" height="24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="product-features">
                                <div className="product-feature"><span className="feature-icon">🚚</span><div><strong>Free Delivery</strong><p>On orders above ₹899</p></div></div>
                                <div className="product-feature"><span className="feature-icon">↩️</span><div><strong>Easy Replacements</strong><p>7 days replacement only</p></div></div>
                                <div className="product-feature"><span className="feature-icon">💯</span><div><strong>100% Original</strong><p>Authentic products</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
