'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, Product } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [activeSubcategory, setActiveSubcategory] = useState('All');

    // Get subcategories from database category, prepend "All"
    const currentSubcategories = category?.subcategories
        ? ['All', ...category.subcategories]
        : ['All'];

    // Redirect to /customized page for customize/customized category
    useEffect(() => {
        if (slug === 'customized' || slug === 'customize') {
            router.replace('/customized');
            return;
        }
    }, [slug, router]);

    useEffect(() => {
        if (slug === 'customized' || slug === 'customize') return; // Don't fetch for customized
        fetchCategoryAndProducts();
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }
    }, [slug]);

    const fetchCategoryAndProducts = async () => {
        setLoading(true);
        try {
            // Fetch category info from database - use array approach instead of .single()
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', slug);

            if (categoryError) {
                console.error('Error fetching category:', categoryError);
            }

            // Set category from first result if exists
            if (categoryData && categoryData.length > 0) {
                setCategory(categoryData[0]);
            }

            // Fetch products for this category
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('category', slug)
                .order('created_at', { ascending: false });

            if (productsError) {
                console.error('Error fetching products:', productsError);
            }
            setProducts(productsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = (productId: string) => {
        const newWishlist = wishlist.includes(productId)
            ? wishlist.filter(id => id !== productId)
            : [...wishlist, productId];

        setWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    };

    // Filter products by subcategory
    const filteredProducts = activeSubcategory === 'All'
        ? products
        : products.filter(p => p.subcategory === activeSubcategory);

    // Get category name from database or fallback to slug
    const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div key={slug} style={{ isolation: 'isolate' }}>
            <Header />
            <main style={{
                paddingTop: '100px',
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
                position: 'relative',
                zIndex: 0,
                overflow: 'hidden'
            }}>
                <div className="container">
                    {/* Breadcrumb */}
                    <div style={{ marginBottom: '24px' }}>
                        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
                            Home
                        </Link>
                        <span style={{ color: '#6b7280', margin: '0 8px' }}>/</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{categoryName}</span>
                    </div>

                    {/* Page Title */}
                    <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
                        {categoryName} Collection
                    </h1>

                    {/* Subcategory Filter Tabs */}
                    <div className="subcategory-tabs">
                        {currentSubcategories.map((sub) => (
                            <button
                                key={sub}
                                className={`subcategory-tab ${activeSubcategory === sub ? 'active' : ''}`}
                                onClick={() => setActiveSubcategory(sub)}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="products-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="products-empty">
                            <p>No products found in this category</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <Link
                                    href={`/product/${product.id}`}
                                    key={product.id}
                                    className="product-card-container"
                                >
                                    {/* Glassy Card */}
                                    <div className="glassy-card">
                                        {/* Wishlist Button */}
                                        <button
                                            className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(product.id);
                                            }}
                                        >
                                            <svg
                                                style={{ width: '18px', height: '18px' }}
                                                fill={wishlist.includes(product.id) ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>

                                        {/* Product Image */}
                                        <div className="product-image-wrapper">
                                            <Image
                                                src={product.images?.[0] || product.image || '/placeholder.jpg'}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>

                                        {/* Price Section */}
                                        <div className="price-section">
                                            <span className="price-value">₹{product.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
