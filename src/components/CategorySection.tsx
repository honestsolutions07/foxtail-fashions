'use client';

import { useState } from 'react';
import Image from 'next/image';

const categories = [
    { id: 'all', name: 'Trending', icon: '🔥' },
    { id: 'casual', name: 'Casual Wears', icon: '👕' },
    { id: 'formal', name: 'Formal Wears', icon: '👔' },
    { id: 'denim', name: 'Denim Collection', icon: '👖' },
    { id: 'accessories', name: 'Accessories', icon: '⌚' },
];

const products = [
    {
        id: 1,
        name: 'Navy Casual Jacket',
        category: 'casual',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=500&fit=crop',
        tag: 'Best Seller',
    },
    {
        id: 2,
        name: 'Tan Leather Jacket',
        category: 'casual',
        price: 189.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
        tag: 'New',
    },
    {
        id: 3,
        name: 'Classic Denim Jacket',
        category: 'denim',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop',
        tag: null,
    },
    {
        id: 4,
        name: 'Wool Formal Jacket',
        category: 'formal',
        price: 259.99,
        image: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=400&h=500&fit=crop',
        tag: 'Premium',
    },
    {
        id: 5,
        name: 'Summer Cotton Outfit',
        category: 'casual',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=500&fit=crop',
        tag: null,
    },
    {
        id: 6,
        name: 'Aviator Sunglasses',
        category: 'accessories',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop',
        tag: 'Trending',
    },
];

const CategorySection = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <section style={{ padding: '60px 0', background: '#f9fafb' }}>
            <div className="container">
                {/* Header */}
                <div className="section-header">
                    <p className="section-label">CATEGORIES</p>
                    <h2 className="section-title">Find Your Style</h2>
                    <p className="section-description">
                        Shop by category and find items that suit your personality and style preferences.
                    </p>
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }} className="products-grid">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-card-image img-zoom" style={{ aspectRatio: '3/4' }}>
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {product.tag && (
                                    <span className="product-tag">{product.tag}</span>
                                )}
                                <button className="btn-icon" style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    opacity: 0,
                                    transform: 'translateY(8px)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                            <h3 style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{product.name}</h3>
                            <p className="text-muted" style={{ fontSize: '14px' }}>${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
