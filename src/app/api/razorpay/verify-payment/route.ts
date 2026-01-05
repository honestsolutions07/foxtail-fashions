import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if SECRET is configured
        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay secret is not configured');
        }

        // Create the expected signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        // Verify the signature
        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
