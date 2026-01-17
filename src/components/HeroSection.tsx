'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase, Ad } from '@/lib/supabase';

const HeroSection = () => {
    const [activeAd, setActiveAd] = useState<Ad | null>(null);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const { data } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('active', true)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (data && data.length > 0) setActiveAd(data[0]);
            } catch (error) {
                console.log('No active ads found');
            }
        };
        fetchAd();
    }, []);
    return (
        <section style={{ paddingTop: '100px', paddingBottom: '40px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="hero-grid">
                    {/* Left Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        {/* Heading */}
                        <div>
                            <h1 className="hero-title">
                                Redefine Your
                                <br />
                                <span style={{ position: 'relative', display: 'inline-block' }}>
                                    Style
                                    <svg style={{ position: 'absolute', bottom: '-8px', left: '0', width: '100%' }} viewBox="0 0 200 12" fill="none">
                                        <path d="M2 10C50 2 150 2 198 10" stroke="#c8ff00" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </h1>
                        </div>

                        {/* Ad Card */}
                        {activeAd && (
                            <div className="hero-ad-card">
                                <Image
                                    src={activeAd.image_url}
                                    alt="Special Offer"
                                    width={1200}
                                    height={300}
                                    style={{ width: '100%', height: 'auto' }}
                                    priority
                                />
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-muted body-text" style={{ maxWidth: '420px' }}>
                            Discover the perfect blend of comfort and elegance. Our curated collection brings you the latest trends in fashion.
                        </p>

                        {/* CTA Button and Stats */}
                        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center' }}>
                            <button className="btn-primary hero-btn">
                                Explore Collection
                                <svg className="hero-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>

                            {/* Stats - Happy Customers */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="stats-container">
                                <div style={{ display: 'flex', marginLeft: '-6px' }} className="avatar-stack">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="avatar-circle"
                                            style={{
                                                borderRadius: '50%',
                                                border: '2px solid white',
                                                marginLeft: '-6px',
                                                background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 30}, 70%, 50%))`
                                            }}
                                        />
                                    ))}
                                </div>
                                <div>
                                    <p className="stats-number" style={{ fontWeight: '700', margin: 0 }}>5200+</p>
                                    <p className="stats-label" style={{ color: '#6b7280', margin: 0 }}>Happy Customers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
