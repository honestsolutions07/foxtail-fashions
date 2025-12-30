'use client';

import { useState } from 'react';

const NewsletterSection = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Subscribed:', email);
        setEmail('');
    };

    return (
        <section className="gradient-lime-light" style={{ padding: '60px 0' }}>
            <div className="container">
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ color: '#65a30d', fontWeight: '600', fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase' }}>NEWSLETTER</p>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.2' }}>
                        Stay Updated with
                        <br />
                        Latest Trends
                    </h2>
                    <p className="text-muted" style={{ marginBottom: '32px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and style tips.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px', margin: '0 auto' }} className="newsletter-form">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="input-field"
                            required
                        />
                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                            Subscribe
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </form>

                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
                        By subscribing, you agree to our Privacy Policy and consent to receive updates.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
