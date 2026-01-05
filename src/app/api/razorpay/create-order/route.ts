import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay only if keys are present (prevents build errors)
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

export async function POST(request: NextRequest) {
    try {
        const { amount, currency = 'INR', receipt } = await request.json();

        if (!amount) {
            return NextResponse.json(
                { error: 'Amount is required' },
                { status: 400 }
            );
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        if (!razorpay) {
            throw new Error('Razorpay keys are not configured');
        }

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
