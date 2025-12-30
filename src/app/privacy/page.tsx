'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div style={{ isolation: 'isolate' }}>
            <Header />
            <main style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh', background: '#f9fafb' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' }}>Privacy Policy</h1>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>1. Introduction</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    Welcome to Foxtail Fashions. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>2. Data We Collect</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7', marginBottom: '12px' }}>
                                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                                </p>
                                <ul style={{ paddingLeft: '20px', color: '#4b5563', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                                    <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                    <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                                    <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>3. How We Use Your Data</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                                </p>
                                <ul style={{ paddingLeft: '20px', color: '#4b5563', lineHeight: '1.7', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>4. Data Security</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                                </p>
                            </section>

                            <section>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#0f172a' }}>5. Contact Us</h2>
                                <p style={{ color: '#4b5563', lineHeight: '1.7' }}>
                                    If you have any questions about this privacy policy or our privacy practices, please contact us at:
                                    <br /><br />
                                    Email: foxtailfashions.help@gmail.com<br />
                                    Phone: +91 99520 85521<br />
                                    Address: Ramachettypalayam, Sundakkmuthur road, Coimbatore.
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
