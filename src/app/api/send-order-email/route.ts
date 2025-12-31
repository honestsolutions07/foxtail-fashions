import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    customer_email: string;
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

const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER, // info@foxtailfashions.in
        pass: process.env.EMAIL_PASS, // GoDaddy email password
    },
});

const generateOrderEmailHTML = (order: OrderData, isAdmin: boolean = false) => {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.size}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #365314 0%, #4d7c0f 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Foxtail Fashions</h1>
                <p style="color: #bef264; margin: 10px 0 0 0; font-size: 14px;">Premium Fashion | Coimbatore</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">
                ${isAdmin ? `
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #92400e; font-weight: 600;">🔔 New Order Received!</p>
                    </div>
                ` : `
                    <h2 style="color: #1f2937; margin: 0 0 10px 0;">Thank You for Your Order! 🎉</h2>
                    <p style="color: #6b7280; margin: 0 0 25px 0;">Hi ${order.customer_name}, your order has been confirmed.</p>
                `}

                <!-- Order Info -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>Order ID:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${order.id.slice(-8).toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Invoice No:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${order.invoice_number || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Order Date:</strong></td>
                            <td style="padding: 8px 0; text-align: right;">${orderDate}</td>
                        </tr>
                    </table>
                </div>

                <!-- Customer Details -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">📦 Shipping Details</h3>
                    <p style="margin: 5px 0; color: #374151;"><strong>${order.customer_name}</strong></p>
                    <p style="margin: 5px 0; color: #6b7280;">📞 ${order.customer_phone}</p>
                    <p style="margin: 5px 0; color: #6b7280;">✉️ ${order.customer_email}</p>
                    <p style="margin: 5px 0; color: #6b7280;">📍 ${order.shipping_address}, ${order.city}, ${order.state} - ${order.pincode}</p>
                </div>

                <!-- Order Items -->
                <div style="margin-bottom: 25px;">
                    <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">🛍️ Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #1f2937; color: #ffffff;">
                                <th style="padding: 12px; text-align: left;">Product</th>
                                <th style="padding: 12px; text-align: center;">Size</th>
                                <th style="padding: 12px; text-align: center;">Qty</th>
                                <th style="padding: 12px; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </div>

                <!-- Price Summary -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right;">₹${order.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        ${order.gst_amount ? `
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">GST (5%)</td>
                            <td style="padding: 8px 0; text-align: right;">₹${order.gst_amount.toLocaleString('en-IN')}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
                            <td style="padding: 8px 0; text-align: right;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</td>
                        </tr>
                        ${order.discount_amount && order.discount_amount > 0 ? `
                        <tr>
                            <td style="padding: 8px 0; color: #10b981;">Coupon (${order.coupon_code})</td>
                            <td style="padding: 8px 0; text-align: right; color: #10b981;">-₹${order.discount_amount.toLocaleString('en-IN')}</td>
                        </tr>
                        ` : ''}
                        ${order.coins_redeemed && order.coins_redeemed > 0 ? `
                        <tr>
                            <td style="padding: 8px 0; color: #10b981;">Fox Coins</td>
                            <td style="padding: 8px 0; text-align: right; color: #10b981;">-₹${order.coins_redeemed.toLocaleString('en-IN')}</td>
                        </tr>
                        ` : ''}
                        <tr style="border-top: 2px solid #1f2937;">
                            <td style="padding: 15px 0 8px 0; font-size: 18px; font-weight: 700;">Grand Total</td>
                            <td style="padding: 15px 0 8px 0; text-align: right; font-size: 18px; font-weight: 700; color: #365314;">₹${order.total.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                ${!isAdmin ? `
                <!-- Customer Message -->
                <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                    <p style="margin: 0; color: #065f46;">We'll notify you when your order ships!</p>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">For any queries, contact us at info@foxtailfashions.in</p>
                </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 25px; text-align: center;">
                <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">Foxtail Fashions</p>
                <p style="color: #6b7280; margin: 0; font-size: 12px;">Ramachettypalayam, Sundakkmuthur Road, Coimbatore</p>
                <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">© 2024 Foxtail Fashions. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export async function POST(request: NextRequest) {
    try {
        const { order } = await request.json();

        if (!order) {
            return NextResponse.json({ error: 'Order data is required' }, { status: 400 });
        }

        console.log('📧 Sending order emails for order:', order.id);
        console.log('Customer email:', order.customer_email);
        console.log('Admin email:', process.env.ADMIN_EMAIL);

        // Send email to customer
        try {
            const customerResult = await transporter.sendMail({
                from: `"Foxtail Fashions" <${process.env.EMAIL_USER}>`,
                to: order.customer_email,
                subject: `Order Confirmed! - Order #${order.id.slice(-8).toUpperCase()}`,
                html: generateOrderEmailHTML(order, false),
            });
            console.log('✅ Customer email sent:', customerResult.messageId);
        } catch (customerError) {
            console.error('❌ Customer email failed:', customerError);
        }

        // Send email to admin
        try {
            const adminResult = await transporter.sendMail({
                from: `"Foxtail Fashions" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: `New Order Received - #${order.id.slice(-8).toUpperCase()} - Rs.${order.total}`,
                html: generateOrderEmailHTML(order, true),
            });
            console.log('✅ Admin email sent:', adminResult.messageId);
        } catch (adminError) {
            console.error('❌ Admin email failed:', adminError);
        }

        return NextResponse.json({ success: true, message: 'Email process completed' });
    } catch (error) {
        console.error('❌ Error in email API:', error);
        return NextResponse.json({ error: 'Failed to process email' }, { status: 500 });
    }
}
