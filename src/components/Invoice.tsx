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
    customer_phone: string;
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
        const imgWidth = 210; // A4 width in mm
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
        <div className="invoice-overlay">
            <div className="invoice-modal">
                <div className="invoice-actions">
                    <button onClick={downloadPDF} className="download-btn">
                        📥 Download PDF
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="close-btn">
                            ✕
                        </button>
                    )}
                </div>

                <div ref={invoiceRef} className="invoice-content">
                    {/* Header */}
                    <div className="invoice-header">
                        <div className="company-info">
                            <h1>🦊 {COMPANY_INFO.name}</h1>
                            <p>{COMPANY_INFO.address}</p>
                            <p><strong>GSTIN:</strong> {COMPANY_INFO.gstin}</p>
                        </div>
                        <div className="invoice-meta">
                            <h2>TAX INVOICE</h2>
                            <p><strong>Invoice No:</strong> {order.invoice_number || `INV-${order.id.slice(-8)}`}</p>
                            <p><strong>Date:</strong> {invoiceDate}</p>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="bill-to">
                        <h3>Bill To:</h3>
                        <p><strong>{order.customer_name}</strong></p>
                        <p>📞 {order.customer_phone}</p>
                        <p>{order.shipping_address}</p>
                        <p>{order.city}, {order.state} - {order.pincode}</p>
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
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.size}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{item.price.toLocaleString('en-IN')}</td>
                                    <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Price Breakdown */}
                    <div className="invoice-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>GST (5%)</span>
                            <span>₹{(order.gst_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                        </div>
                        {order.discount_amount && order.discount_amount > 0 && (
                            <div className="summary-row discount">
                                <span>Coupon Discount ({order.coupon_code})</span>
                                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {order.coins_redeemed && order.coins_redeemed > 0 && (
                            <div className="summary-row discount">
                                <span>Fox Coins Discount</span>
                                <span>-₹{order.coins_redeemed.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="summary-row total">
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
                        <div className="signature-line"></div>
                        <p><strong>{COMPANY_INFO.signatory}</strong></p>
                        <p>{COMPANY_INFO.name}</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
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
                    padding: 2rem;
                    overflow-y: auto;
                    z-index: 1000;
                }
                .invoice-modal {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    max-width: 800px;
                    width: 100%;
                }
                .invoice-actions {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }
                .download-btn {
                    background: #10b981;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .close-btn {
                    background: #ef4444;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                .invoice-content {
                    padding: 2rem;
                    background: white;
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 2px solid #1f2937;
                    padding-bottom: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .company-info h1 {
                    font-size: 1.75rem;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                .company-info p {
                    color: #6b7280;
                    font-size: 0.9rem;
                    margin: 0.25rem 0;
                }
                .invoice-meta {
                    text-align: right;
                }
                .invoice-meta h2 {
                    color: #1f2937;
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                .invoice-meta p {
                    font-size: 0.9rem;
                    margin: 0.25rem 0;
                }
                .bill-to {
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
                .bill-to h3 {
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-bottom: 0.5rem;
                }
                .bill-to p {
                    margin: 0.25rem 0;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.5rem;
                }
                .invoice-table th {
                    background: #1f2937;
                    color: white;
                    padding: 0.75rem;
                    text-align: left;
                    font-size: 0.85rem;
                }
                .invoice-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 0.9rem;
                }
                .invoice-summary {
                    max-width: 300px;
                    margin-left: auto;
                    margin-bottom: 1.5rem;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                }
                .summary-row.discount {
                    color: #10b981;
                }
                .summary-row.total {
                    font-size: 1.1rem;
                    font-weight: 700;
                    border-top: 2px solid #1f2937;
                    padding-top: 0.75rem;
                    margin-top: 0.5rem;
                }
                .invoice-terms {
                    background: #fef3c7;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
                .invoice-terms h4 {
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }
                .invoice-terms ul {
                    margin: 0;
                    padding-left: 1.25rem;
                    font-size: 0.8rem;
                    color: #92400e;
                }
                .invoice-signature {
                    text-align: right;
                    padding-top: 1rem;
                }
                .signature-line {
                    border-bottom: 1px solid #1f2937;
                    width: 200px;
                    margin-left: auto;
                    margin-bottom: 0.5rem;
                    margin-top: 2rem;
                }
                .invoice-signature p {
                    margin: 0.25rem 0;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
