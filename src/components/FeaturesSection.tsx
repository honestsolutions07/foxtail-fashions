'use client';

import Image from 'next/image';

const features = [
    {
        icon: '✨',
        title: 'Premium Quality',
        description: 'The gently curved lines accentuated by edge details are kind to your body and pleasant to look at.',
    },
    {
        icon: '🌿',
        title: 'Sustainable Fashion',
        description: 'Details are kind to your body and planet. This durability is skill and compassion always present.',
    },
    {
        icon: '🚚',
        title: 'Fast Delivery',
        description: 'Get your orders delivered within 3-5 business days. Free shipping on orders above 899.',
    },
];

const FeaturesSection = () => {
    return (
        <section style={{ padding: '60px 0', background: '#0f172a', color: 'white' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }} className="features-grid">
                    {/* Content Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <p className="small-text" style={{ color: '#c8ff00', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>WHY CHOOSE US</p>
                            <h2 className="section-title">
                                Discover a Smarter Way
                                <br />
                                to Buy and Sell.
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>
                                    <div className="feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* Image Side */}
                    <div style={{ position: 'relative' }}>
                        <div style={{ aspectRatio: '4/5', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                            <Image
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop"
                                alt="Fashion model"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        {/* Decorative Elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-16px',
                            right: '-16px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(200, 255, 0, 0.2)',
                            filter: 'blur(40px)'
                        }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
