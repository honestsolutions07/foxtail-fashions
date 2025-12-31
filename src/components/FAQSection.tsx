'use client';

import { useState } from 'react';

const faqs = [
    {
        question: 'What are your standard delivery timeframes?',
        answer: 'We offer standard delivery within 5-7 business days and express delivery within 2-3 business days across India.',
    },
    {
        question: 'What are the delivery charges?',
        answer: 'A standard delivery charge of ₹99 is applicable on all orders, regardless of the order value. This helps us ensure safe and timely delivery of your products.',
    },
    {
        question: 'What is your replacement policy?',
        answer: 'We do not offer returns. However, we offer free replacements for damaged, defective, or incorrect items within 7 days of delivery. Please ensure items are unworn and have original tags.',
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

                </div>
            </div>
        </section>
    );
};

export default FAQSection;
