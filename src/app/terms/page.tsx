'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh', background: '#f9fafb' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>Terms & Conditions</h1>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <section>
                                <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '20px' }}>
                                    Welcome to Foxtail Fashions. By accessing or purchasing from our website, you agree to be bound by the following terms and conditions. Please read them carefully before making any purchase.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>1. Accuracy of Products</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    We strive to ensure that the products displayed on our page/website are accurate in terms of color, size, and description. However, due to lighting, monitor settings, and other factors, the actual appearance of the product may vary.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>2. Delivery Estimates</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    Delivery times are estimates and may vary depending on your location. We are not responsible for delays caused by the courier or other external factors.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>3. Replacement Policy</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    We do not accept returns. However, we offer replacements for damaged or incorrect items. Please review your order carefully before completing your purchase. All sales are final.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>4. Defective Items</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    If you receive a damaged or defective item, please contact us within 7 days of receiving the product with photographic evidence. We will assess the situation and, if necessary, provide a replacement item or store credit at our discretion.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>5. Privacy</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    Your privacy is important to us. We collect personal information only as necessary for processing orders and providing customer service.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
