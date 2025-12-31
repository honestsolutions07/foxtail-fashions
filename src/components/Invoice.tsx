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
    'This is a computer-generated invoice.',
];

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
        <>
            <style>{`
                .invoice-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 1rem;
                    overflow-y: auto;
                    z-index: 9999;
                }
                .invoice-modal {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    max-width: 800px;
                    width: 100%;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .invoice-actions {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                }
                .invoice-download-btn {
                    background: #10b981;
                    color: white;
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .invoice-close-btn {
                    background: #ef4444;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                }
                .invoice-content {
                    padding: 1rem;
                    background: white;
                }
                .invoice-header {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    border-bottom: 2px solid #1f2937;
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                }
                .invoice-company-logo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 0.25rem;
                }
                .invoice-company-logo img {
                    width: 30px;
                    height: 30px;
                }
                .invoice-company-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                }
                .invoice-company-text {
                    color: #6b7280;
                    font-size: 0.8rem;
                    margin: 0.15rem 0;
                }
                .invoice-meta-section {
                    background: #f3f4f6;
                    padding: 0.75rem;
                    border-radius: 8px;
                }
                .invoice-title {
                    color: #1f2937;
                    font-size: 1.1rem;
                    margin: 0 0 0.5rem 0;
                    font-weight: 700;
                }
                .invoice-meta-text {
                    font-size: 0.8rem;
                    margin: 0.15rem 0;
                }
                .invoice-bill-to {
                    background: #f9fafb;
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .invoice-bill-title {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin: 0 0 0.25rem 0;
                }
                .invoice-bill-text {
                    margin: 0.15rem 0;
                    font-size: 0.85rem;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    font-size: 0.75rem;
                }
                .invoice-table th {
                    background: #1f2937;
                    color: white;
                    padding: 0.5rem 0.25rem;
                    text-align: left;
                    font-size: 0.7rem;
                }
                .invoice-table td {
                    padding: 0.5rem 0.25rem;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 0.75rem;
                }
                .invoice-summary {
                    margin-bottom: 1rem;
                }
                .invoice-summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.35rem 0;
                    font-size: 0.85rem;
                }
                .invoice-summary-row.discount {
                    color: #10b981;
                }
                .invoice-summary-row.total {
                    font-size: 1rem;
                    font-weight: 700;
                    border-top: 2px solid #1f2937;
                    padding-top: 0.5rem;
                    margin-top: 0.25rem;
                }
                .invoice-terms {
                    background: #fef3c7;
                    padding: 0.75rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .invoice-terms h4 {
                    font-size: 0.75rem;
                    margin: 0 0 0.25rem 0;
                }
                .invoice-terms ul {
                    margin: 0;
                    padding-left: 1rem;
                    font-size: 0.7rem;
                    color: #92400e;
                }
                .invoice-signature {
                    text-align: right;
                    padding-top: 0.5rem;
                }
                .invoice-signature-line {
                    border-bottom: 1px solid #1f2937;
                    width: 150px;
                    margin-left: auto;
                    margin-bottom: 0.25rem;
                    margin-top: 1rem;
                }
                .invoice-signature p {
                    margin: 0.15rem 0;
                    font-size: 0.8rem;
                }
                @media (min-width: 640px) {
                    .invoice-overlay {
                        padding: 2rem;
                    }
                    .invoice-content {
                        padding: 2rem;
                    }
                    .invoice-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                    .invoice-company-name {
                        font-size: 1.5rem;
                    }
                    .invoice-company-text {
                        font-size: 0.9rem;
                    }
                    .invoice-meta-section {
                        text-align: right;
                    }
                    .invoice-table th, .invoice-table td {
                        padding: 0.75rem;
                        font-size: 0.85rem;
                    }
                    .invoice-summary {
                        max-width: 300px;
                        margin-left: auto;
                    }
                }
            `}</style>

            <div className="invoice-overlay">
                <div className="invoice-modal">
                    <div className="invoice-actions">
                        <button onClick={downloadPDF} className="invoice-download-btn">
                            📥 Download PDF
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="invoice-close-btn">
                                ✕
                            </button>
                        )}
                    </div>

                    <div ref={invoiceRef} className="invoice-content">
                        {/* Header */}
                        <div className="invoice-header">
                            <div>
                                <div className="invoice-company-logo">
                                    <img src="/logo.png" alt="Logo" />
                                    <h1 className="invoice-company-name">{COMPANY_INFO.name}</h1>
                                </div>
                                <p className="invoice-company-text">{COMPANY_INFO.address}</p>
                                <p className="invoice-company-text"><strong>GSTIN:</strong> {COMPANY_INFO.gstin}</p>
                            </div>
                            <div className="invoice-meta-section">
                                <h2 className="invoice-title">TAX INVOICE</h2>
                                <p className="invoice-meta-text"><strong>Invoice:</strong> {order.invoice_number || `INV-${order.id.slice(-8)}`}</p>
                                <p className="invoice-meta-text"><strong>Date:</strong> {invoiceDate}</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="invoice-bill-to">
                            <h3 className="invoice-bill-title">Bill To:</h3>
                            <p className="invoice-bill-text"><strong>{order.customer_name}</strong></p>
                            {order.customer_phone && <p className="invoice-bill-text">📞 {order.customer_phone}</p>}
                            <p className="invoice-bill-text">{order.shipping_address}</p>
                            <p className="invoice-bill-text">{order.city}, {order.state} - {order.pincode}</p>
                        </div>

                        {/* Items Table */}
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Size</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th>Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.product_name}</td>
                                        <td>{item.size}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td>₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Price Breakdown */}
                        <div className="invoice-summary">
                            <div className="invoice-summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="invoice-summary-row">
                                <span>GST (5%)</span>
                                <span>₹{(order.gst_amount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="invoice-summary-row">
                                <span>Shipping</span>
                                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                            </div>
                            {order.discount_amount && order.discount_amount > 0 && (
                                <div className="invoice-summary-row discount">
                                    <span>Coupon ({order.coupon_code})</span>
                                    <span>-₹{order.discount_amount}</span>
                                </div>
                            )}
                            {order.coins_redeemed && order.coins_redeemed > 0 && (
                                <div className="invoice-summary-row discount">
                                    <span>Fox Coins</span>
                                    <span>-₹{order.coins_redeemed}</span>
                                </div>
                            )}
                            <div className="invoice-summary-row total">
                                <span>Grand Total</span>
                                <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="invoice-terms">
                            <h4>Terms & Conditions:</h4>
                            <ul>
                                {TERMS.map((term, idx) => (
                                    <li key={idx}>{term}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Signature */}
                        <div className="invoice-signature">
                            <p>For {COMPANY_INFO.name}</p>
                            <div className="invoice-signature-line"></div>
                            <p><strong>{COMPANY_INFO.signatory}</strong></p>
                            <p>{COMPANY_INFO.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
