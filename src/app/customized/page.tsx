'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

interface CustomOption {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    images: number;
}

const defaultOptions: CustomOption[] = [
    {
        id: 'men',
        title: "Men's T-Shirt",
        description: 'Design your own custom t-shirt with your images',
        image: '/custom-men.png',
        price: 599,
        images: 2,
    },
    {
        id: 'women',
        title: "Women's T-Shirt",
        description: 'Create a personalized t-shirt just for her',
        image: '/custom-women.png',
        price: 599,
        images: 2,
    },
    {
        id: 'couple',
        title: 'Couple Combo',
        description: 'Matching custom t-shirts for couples',
        image: '/custom-couple.png',
        price: 1099,
        images: 4,
    },
];

export default function CustomizedPage() {
    const [customOptions, setCustomOptions] = useState<CustomOption[]>(defaultOptions);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const { data } = await supabase
                    .from('custom_tshirt_prices')
                    .select('*');

                if (data && data.length > 0) {
                    // Update prices from database
                    setCustomOptions(prev => prev.map(option => {
                        const dbPrice = data.find(p => p.id === option.id);
                        return dbPrice ? { ...option, price: dbPrice.price } : option;
                    }));
                }
            } catch (error) {
                console.log('Using default prices');
            }
        };
        fetchPrices();
    }, []);

    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main className="customized-page">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <span>Customized</span>
                    </div>

                    <div className="customized-hero">
                        <h1>🎨 Create Your Custom T-Shirt</h1>
                        <p>Upload your own designs and we'll print them on high-quality t-shirts!</p>
                    </div>

                    <div className="customized-options">
                        {customOptions.map((option) => {
                            const whatsappMessage = `Hi! I'm interested in ordering a ${option.title} (₹${option.price}) from Foxtail Fashions. Please help me with the customization.`;
                            const whatsappUrl = `https://wa.me/919952085521?text=${encodeURIComponent(whatsappMessage)}`;

                            return (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={option.id}
                                    className="customized-option-card"
                                >
                                    <div className="option-text-content">
                                        <h2>{option.title}</h2>
                                        <p>{option.description}</p>
                                        <div className="option-details">
                                            <span className="option-price">₹{option.price}</span>
                                            <span className="option-images">{option.images} Images</span>
                                        </div>
                                        <div className="option-cta">
                                            Order via WhatsApp →
                                        </div>
                                    </div>
                                    <div className="option-image">
                                        <Image
                                            src={option.image}
                                            alt={option.title}
                                            width={200}
                                            height={220}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                    <div className="customized-info">
                        <h3>How It Works</h3>
                        <div className="info-steps">
                            <div className="info-step">
                                <span className="step-number">1</span>
                                <h4>Choose Type</h4>
                                <p>Select Men's, Women's or Couple Combo</p>
                            </div>
                            <div className="info-step">
                                <span className="step-number">2</span>
                                <h4>Upload Images</h4>
                                <p>Add your front & back designs</p>
                            </div>
                            <div className="info-step">
                                <span className="step-number">3</span>
                                <h4>Pick Color & Size</h4>
                                <p>Choose your preferred t-shirt color</p>
                            </div>
                            <div className="info-step">
                                <span className="step-number">4</span>
                                <h4>Place Order</h4>
                                <p>We'll print & deliver to you!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
