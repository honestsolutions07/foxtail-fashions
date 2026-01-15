'use client';

import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
    company: [
        { name: 'About Us', href: '/about' },

    ],

    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },

    ],

};

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/_foxtail_fashions_?igsh=c3ExMDJ4c3piMjFu', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
];

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                {/* Top Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="footer-grid">
                    {/* Brand */}
                    <div style={{ gridColumn: 'span 2' }} className="footer-brand-col">
                        <div className="footer-brand">
                            <Image
                                src="/foxtail-logo.png"
                                alt="Foxtail Fashions Logo"
                                width={40}
                                height={40}
                                style={{ objectFit: 'contain' }}
                            />
                            <span style={{ fontSize: '20px', fontWeight: '700' }}>Foxtail Fashions</span>
                        </div>
                        <p className="footer-description">
                            Your Complete Source for Premium Quality Fashion. Discover timeless style and modern elegance.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon"
                                    aria-label={social.name}
                                >
                                    <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24">
                                        <path d={social.icon} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}




                    <div>
                        {footerLinks.legal.map((link) => (
                            <Link key={link.name} href={link.href} className="footer-link">{link.name}</Link>
                        ))}
                    </div>

                    <div>
                        <h4 className="footer-title">Contact Us</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#9ca3af', fontSize: '14px' }}>
                            <p style={{ margin: 0 }}>
                                <span style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '4px' }}>Email</span>
                                foxtailfashions.help@gmail.com
                            </p>
                            <p style={{ margin: 0 }}>
                                <span style={{ display: 'block', color: 'white', fontWeight: '500', marginBottom: '4px' }}>Phone</span>
                                +91 99520 85521
                            </p>
                        </div>
                    </div>


                </div>

                {/* Bottom Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '24px' }} className="footer-bottom">
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                        © {new Date().getFullYear()} Foxtail Fashions. All rights reserved.
                    </p>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
