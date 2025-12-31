'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderItem {
    product_name: string;
    size: string;
    quantity: number;
    price: number;
}

interface OrderData {
    id: string;
    invoice_number?: string;
    customer_name: string;
    customer_phone?: string;
    shipping_address: string;
    city: string;
    state: string;
    pincode: string;
    items: OrderItem[];
    subtotal: number;
    gst_amount?: number;
    shipping: number;
    discount_amount?: number;
    coupon_code?: string;
    coins_redeemed?: number;
    total: number;
    created_at: string;
}

interface InvoiceProps {
    order: OrderData;
    onClose?: () => void;
}

const COMPANY_INFO = {
    name: 'Foxtail Fashions',
    address: 'Ramachettypalayam, Sundakkmuthur Road, Coimbatore',
    gstin: '33GFLPM7586H1ZS',
    signatory: 'Subash Rahul M',
};

const TERMS = [
    'Goods once sold cannot be returned, only exchanged within 7 days.',
    'Exchange is subject to product availability.',
    'This is a computer-generated invoice and does not require signature.',
];

// Inline styles object
const styles = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '2rem',
        overflowY: 'auto' as const,
        zIndex: 9999,
    },
    modal: {
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden' as const,
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
    },
    downloadBtn: {
        background: '#10b981',
        color: 'white',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '1rem',
    },
    closeBtn: {
        background: '#ef4444',
        color: 'white',
        width: '40px',
        height: '40px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.2rem',
        cursor: 'pointer',
    },
    content: {
        padding: '2rem',
        background: 'white',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '2px solid #1f2937',
        paddingBottom: '1.5rem',
        marginBottom: '1.5rem',
    },
    companyName: {
        fontSize: '1.75rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        margin: 0,
    },
    companyText: {
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: '0.25rem 0',
    },
    metaSection: {
        textAlign: 'right' as const,
    },
    invoiceTitle: {
        color: '#1f2937',
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        margin: 0,
    },
    metaText: {
        fontSize: '0.9rem',
        margin: '0.25rem 0',
    },
    billTo: {
        background: '#f9fafb',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
    },
    billToTitle: {
        fontSize: '0.9rem',
        color: '#6b7280',
        marginBottom: '0.5rem',
        margin: 0,
    },
    billToText: {
        margin: '0.25rem 0',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: '1.5rem',
    },
    th: {
        background: '#1f2937',
        color: 'white',
        padding: '0.75rem',
        textAlign: 'left' as const,
        fontSize: '0.85rem',
    },
    td: {
        padding: '0.75rem',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '0.9rem',
    },
    summary: {
        maxWidth: '300px',
        marginLeft: 'auto',
        marginBottom: '1.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        fontSize: '0.9rem',
    },
    summaryRowDiscount: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        fontSize: '0.9rem',
        color: '#10b981',
    },
    summaryRowTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        fontSize: '1.1rem',
        fontWeight: 700,
        borderTop: '2px solid #1f2937',
        marginTop: '0.5rem',
    },
    terms: {
        background: '#fef3c7',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
    },
    termsTitle: {
        fontSize: '0.85rem',
        marginBottom: '0.5rem',
        margin: 0,
    },
    termsList: {
        margin: 0,
        paddingLeft: '1.25rem',
        fontSize: '0.8rem',
        color: '#92400e',
    },
    signature: {
        textAlign: 'right' as const,
        paddingTop: '1rem',
    },
    signatureLine: {
        borderBottom: '1px solid #1f2937',
        width: '200px',
        marginLeft: 'auto',
        marginBottom: '0.5rem',
        marginTop: '2rem',
    },
    signatureText: {
        margin: '0.25rem 0',
        fontSize: '0.9rem',
    },
};

export default function Invoice({ order, onClose }: InvoiceProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        if (!invoiceRef.current) return;

        const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Invoice-${order.invoice_number || order.id}.pdf`);
    };

    const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.actions}>
                    <button onClick={downloadPDF} style={styles.downloadBtn}>
                        📥 Download PDF
                    </button>
                    {onClose && (
                        <button onClick={onClose} style={styles.closeBtn}>
                            ✕
                        </button>
                    )}
                </div>

                <div ref={invoiceRef} style={styles.content}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
                                <h1 style={styles.companyName}>{COMPANY_INFO.name}</h1>
                            </div>
                            <p style={styles.companyText}>{COMPANY_INFO.address}</p>
                            <p style={styles.companyText}><strong>GSTIN:</strong> {COMPANY_INFO.gstin}</p>
                        </div>
                        <div style={styles.metaSection}>
                            <h2 style={styles.invoiceTitle}>TAX INVOICE</h2>
                            <p style={styles.metaText}><strong>Invoice No:</strong> {order.invoice_number || `INV-${order.id.slice(-8)}`}</p>
                            <p style={styles.metaText}><strong>Date:</strong> {invoiceDate}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div style={styles.billTo}>
                        <h3 style={styles.billToTitle}>Bill To:</h3>
                        <p style={styles.billToText}><strong>{order.customer_name}</strong></p>
                        {order.customer_phone && <p style={styles.billToText}>📞 {order.customer_phone}</p>}
                        <p style={styles.billToText}>{order.shipping_address}</p>
                        <p style={styles.billToText}>{order.city}, {order.state} - {order.pincode}</p>
                    </div>

                    {/* Items Table */}
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Product</th>
                                <th style={styles.th}>Size</th>
                                <th style={styles.th}>Qty</th>
                                <th style={styles.th}>Rate</th>
                                <th style={styles.th}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={styles.td}>{idx + 1}</td>
                                    <td style={styles.td}>{item.product_name}</td>
                                    <td style={styles.td}>{item.size}</td>
                                    <td style={styles.td}>{item.quantity}</td>
                                    <td style={styles.td}>₹{item.price.toLocaleString('en-IN')}</td>
                                    <td style={styles.td}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Price Breakdown */}
                    <div style={styles.summary}>
                        <div style={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>GST (5%)</span>
                            <span>₹{(order.gst_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                        </div>
                        {order.discount_amount && order.discount_amount > 0 && (
                            <div style={styles.summaryRowDiscount}>
                                <span>Coupon ({order.coupon_code})</span>
                                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {order.coins_redeemed && order.coins_redeemed > 0 && (
                            <div style={styles.summaryRowDiscount}>
                                <span>Fox Coins</span>
                                <span>-₹{order.coins_redeemed.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div style={styles.summaryRowTotal}>
                            <span>Grand Total</span>
                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Terms */}
                    <div style={styles.terms}>
                        <h4 style={styles.termsTitle}>Terms & Conditions:</h4>
                        <ul style={styles.termsList}>
                            {TERMS.map((term, idx) => (
                                <li key={idx}>{term}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Signature */}
                    <div style={styles.signature}>
                        <p style={styles.signatureText}>For {COMPANY_INFO.name}</p>
                        <div style={styles.signatureLine}></div>
                        <p style={styles.signatureText}><strong>{COMPANY_INFO.signatory}</strong></p>
                        <p style={styles.signatureText}>{COMPANY_INFO.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
