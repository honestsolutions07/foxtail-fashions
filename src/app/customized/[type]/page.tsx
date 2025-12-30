'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, TshirtColor } from '@/lib/supabase';

const typeConfig = {
    men: {
        title: "Men's Custom T-Shirt",
        defaultPrice: 599,
        needsMenImages: true,
        needsWomenImages: false,
    },
    women: {
        title: "Women's Custom T-Shirt",
        defaultPrice: 599,
        needsMenImages: false,
        needsWomenImages: true,
    },
    couple: {
        title: 'Couple Combo T-Shirts',
        defaultPrice: 1099,
        needsMenImages: true,
        needsWomenImages: true,
    },
};

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function CustomOrderPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type as 'men' | 'women' | 'couple';
    const config = typeConfig[type];

    const [colors, setColors] = useState<TshirtColor[]>([]);
    const [selectedColor, setSelectedColor] = useState<TshirtColor | null>(null);
    const [menSize, setMenSize] = useState('');
    const [womenSize, setWomenSize] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [price, setPrice] = useState(config?.defaultPrice || 599);

    // Image states
    const [frontImageMen, setFrontImageMen] = useState<string | null>(null);
    const [backImageMen, setBackImageMen] = useState<string | null>(null);
    const [frontImageWomen, setFrontImageWomen] = useState<string | null>(null);
    const [backImageWomen, setBackImageWomen] = useState<string | null>(null);

    // File refs
    const frontMenRef = useRef<HTMLInputElement>(null);
    const backMenRef = useRef<HTMLInputElement>(null);
    const frontWomenRef = useRef<HTMLInputElement>(null);
    const backWomenRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchColors();
        fetchPrice();
    }, [type]);

    const fetchColors = async () => {
        try {
            const { data } = await supabase
                .from('tshirt_colors')
                .select('*')
                .eq('available', true)
                .order('name');

            if (data && data.length > 0) {
                setColors(data);
                setSelectedColor(data[0]);
            }
        } catch (error) {
            console.error('Error fetching colors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrice = async () => {
        try {
            const { data } = await supabase
                .from('custom_tshirt_prices')
                .select('price')
                .eq('id', type);

            if (data && data.length > 0) {
                setPrice(data[0].price);
            }
        } catch (error) {
            console.log('Using default price');
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (url: string | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `custom-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `custom-orders/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setter(publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const isFormValid = () => {
        if (!selectedColor) return false;

        if (config.needsMenImages) {
            if (!frontImageMen || !backImageMen || !menSize) return false;
        }

        if (config.needsWomenImages) {
            if (!frontImageWomen || !backImageWomen || !womenSize) return false;
        }

        return true;
    };

    const addToCart = () => {
        if (!isFormValid()) {
            alert('Please complete all fields and upload all images');
            return;
        }

        const customItem = {
            productId: `custom-${type}-${Date.now()}`,
            name: config.title,
            price: price,
            image: frontImageMen || frontImageWomen || '/placeholder.jpg',
            size: type === 'couple' ? `M:${menSize} / W:${womenSize}` : (menSize || womenSize),
            quantity: 1,
            isCustom: true,
            customData: {
                type,
                color: selectedColor?.hex_code,
                color_name: selectedColor?.name,
                men_size: menSize || null,
                women_size: womenSize || null,
                front_image_men: frontImageMen,
                back_image_men: backImageMen,
                front_image_women: frontImageWomen,
                back_image_women: backImageWomen,
            }
        };

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(customItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));

        router.push('/cart');
    };

    if (!config) {
        return (
            <div style={{ isolation: 'isolate' }}>
                <Header />
                <main className="custom-order-page">
                    <div className="container">
                        <h1>Invalid Type</h1>
                        <Link href="/customized">Go Back</Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main className="custom-order-page">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/customized">Customized</Link>
                        <span>/</span>
                        <span>{config.title}</span>
                    </div>

                    <h1 className="custom-order-title">{config.title}</h1>
                    <p className="custom-order-price">₹{price.toLocaleString('en-IN')}</p>

                    <div className="custom-order-layout">
                        {/* Left: Image Uploads */}
                        <div className="custom-uploads-section">
                            {config.needsMenImages && (
                                <div className="upload-group">
                                    <h3>{type === 'couple' ? "👨 Men's T-Shirt" : "Your T-Shirt"}</h3>
                                    <div className="upload-row">
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                ref={frontMenRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setFrontImageMen)}
                                                hidden
                                            />
                                            <div
                                                className={`upload-area ${frontImageMen ? 'has-image' : ''}`}
                                                onClick={() => frontMenRef.current?.click()}
                                            >
                                                {frontImageMen ? (
                                                    <img src={frontImageMen} alt="Front" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                                                ) : (
                                                    <>
                                                        <span className="upload-icon">📤</span>
                                                        <span>Front View</span>
                                                    </>
                                                )}
                                            </div>
                                            <p>Front Design</p>
                                        </div>
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                ref={backMenRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setBackImageMen)}
                                                hidden
                                            />
                                            <div
                                                className={`upload-area ${backImageMen ? 'has-image' : ''}`}
                                                onClick={() => backMenRef.current?.click()}
                                            >
                                                {backImageMen ? (
                                                    <img src={backImageMen} alt="Back" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                                                ) : (
                                                    <>
                                                        <span className="upload-icon">📤</span>
                                                        <span>Back View</span>
                                                    </>
                                                )}
                                            </div>
                                            <p>Back Design</p>
                                        </div>
                                    </div>
                                    <div className="size-selector">
                                        <label>Select Size:</label>
                                        <div className="size-buttons">
                                            {sizes.map((s) => (
                                                <button
                                                    key={s}
                                                    className={`size-btn ${menSize === s ? 'active' : ''}`}
                                                    onClick={() => setMenSize(s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {config.needsWomenImages && (
                                <div className="upload-group">
                                    <h3>{type === 'couple' ? "👩 Women's T-Shirt" : "Your T-Shirt"}</h3>
                                    <div className="upload-row">
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                ref={frontWomenRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setFrontImageWomen)}
                                                hidden
                                            />
                                            <div
                                                className={`upload-area ${frontImageWomen ? 'has-image' : ''}`}
                                                onClick={() => frontWomenRef.current?.click()}
                                            >
                                                {frontImageWomen ? (
                                                    <img src={frontImageWomen} alt="Front" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                                                ) : (
                                                    <>
                                                        <span className="upload-icon">📤</span>
                                                        <span>Front View</span>
                                                    </>
                                                )}
                                            </div>
                                            <p>Front Design</p>
                                        </div>
                                        <div className="upload-box">
                                            <input
                                                type="file"
                                                ref={backWomenRef}
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, setBackImageWomen)}
                                                hidden
                                            />
                                            <div
                                                className={`upload-area ${backImageWomen ? 'has-image' : ''}`}
                                                onClick={() => backWomenRef.current?.click()}
                                            >
                                                {backImageWomen ? (
                                                    <img src={backImageWomen} alt="Back" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                                                ) : (
                                                    <>
                                                        <span className="upload-icon">📤</span>
                                                        <span>Back View</span>
                                                    </>
                                                )}
                                            </div>
                                            <p>Back Design</p>
                                        </div>
                                    </div>
                                    <div className="size-selector">
                                        <label>Select Size:</label>
                                        <div className="size-buttons">
                                            {sizes.map((s) => (
                                                <button
                                                    key={s}
                                                    className={`size-btn ${womenSize === s ? 'active' : ''}`}
                                                    onClick={() => setWomenSize(s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Color Selection */}
                        <div className="custom-options-section">
                            <div className="color-selector">
                                <h3>Select T-Shirt Color</h3>
                                {loading ? (
                                    <p>Loading colors...</p>
                                ) : colors.length === 0 ? (
                                    <p>No colors available. Please contact admin.</p>
                                ) : (
                                    <div className="color-grid">
                                        {colors.map((color) => (
                                            <button
                                                key={color.id}
                                                className={`color-btn ${selectedColor?.id === color.id ? 'active' : ''}`}
                                                style={{ backgroundColor: color.hex_code }}
                                                onClick={() => setSelectedColor(color)}
                                                title={color.name}
                                            >
                                                {selectedColor?.id === color.id && (
                                                    <span className="color-check">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedColor && (
                                    <p className="selected-color-name">Selected: {selectedColor.name}</p>
                                )}
                            </div>

                            <button
                                className="add-to-cart-btn"
                                onClick={addToCart}
                                disabled={!isFormValid() || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Add to Cart - ₹' + price}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
