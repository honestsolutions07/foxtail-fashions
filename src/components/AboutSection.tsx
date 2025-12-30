'use client';

import Image from 'next/image';

const AboutSection = () => {
    return (
        <section style={{ padding: '60px 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="about-grid">
                    {/* Image Side */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ aspectRatio: '4/5', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: '#f3f4f6' }}>
                            <Image
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1000&fit=crop"
                                alt="Fashion craftsmanship"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            {/* Floating Card */}
                            <div className="glass-card" style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                                <p style={{ fontSize: '28px', fontWeight: '700', fontStyle: 'italic', marginBottom: '8px' }}>FASHION</p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', background: '#a3e635', borderRadius: '50%' }}></span>
                                        Premium Quality
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', background: '#a3e635', borderRadius: '50%' }}></span>
                                        Sustainable
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Overlay */}
                        <div className="card-padded stats-overlay" style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
                            display: 'none'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '28px', fontWeight: '700', color: '#65a30d' }}>230+</p>
                                    <p style={{ fontSize: '13px', color: '#6b7280' }}>Products</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '28px', fontWeight: '700' }}>9/10</p>
                                    <p style={{ fontSize: '13px', color: '#6b7280' }}>Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                            <p className="section-label">ABOUT US</p>
                            <h2 className="section-title">
                                Heritage Meets
                                <br />
                                Modern Craftsmanship
                            </h2>
                        </div>

                        <p className="text-muted" style={{ fontSize: '16px', lineHeight: '1.8' }}>
                            We believe in creating timeless pieces that transcend seasons. Our commitment to quality craftsmanship and sustainable practices ensures every piece tells a story of excellence.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div className="stat-item">
                                <p className="stat-number">15+</p>
                                <p className="stat-label">Years Experience</p>
                            </div>
                            <div className="stat-item">
                                <p className="stat-number">50K</p>
                                <p className="stat-label">Products Sold</p>
                            </div>
                            <div className="stat-item">
                                <p className="stat-number">98%</p>
                                <p className="stat-label">Satisfaction</p>
                            </div>
                        </div>

                        <button className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                            Learn More About Us
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
