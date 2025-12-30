'use client';

import { useState } from 'react';

const faqs = [
    {
        question: 'What are your standard delivery timeframes?',
        answer: 'We offer standard delivery within 5-7 business days and express delivery within 2-3 business days. Free shipping is available on orders over Rs. 899.',
    },
    {
        question: 'What is your return and exchange policy?',
        answer: 'We accept returns and exchanges within 30 days of purchase. Items must be unworn, unwashed, and with original tags attached. Free returns are available for all orders.',
    },
    {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking number in order details. You can use this to track your package on courier site.',
    },
    {
        question: 'Do you offer All over India shipping?',
        answer: 'Yes! We ship to all over India.',
    },

];

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section style={{ padding: '60px 0' }}>
            <div className="container">
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <p className="section-label">SUPPORT</p>
                        <h2 className="section-title" style={{ textAlign: 'center' }}>
                            Frequently Asked
                            <br />
                            Questions
                        </h2>
                    </div>

                    {/* FAQ List */}
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                                >
                                    <span style={{ flex: 1 }}>{faq.question}</span>
                                    <span className="faq-toggle">
                                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <p className="text-muted" style={{ marginBottom: '16px' }}>Still have questions?</p>
                        <button className="btn-primary">
                            Contact Support
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
