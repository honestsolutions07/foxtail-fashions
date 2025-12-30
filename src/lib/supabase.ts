import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    max_discount_amount?: number;
    expires_at?: string;
    is_active: boolean;
    usage_limit?: number;
    used_count: number;
    created_at: string;
}

export interface ReplacementRequest {
    id: string;
    order_id: string;
    user_id: string;
    reason: string;
    description?: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

// Regular client for user operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for admin operations (bypasses RLS)
// Only use this for authenticated admin operations
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : supabase; // Fallback to regular client if no service key

// Type definitions for our database
export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    subcategory: string;
    image: string;
    images?: string[];
    description: string;
    size_mode?: 'all' | 'select';
    sizes?: { [key: string]: number };
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
    created_at: string;
}

export interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'cod';
    cancel_reason?: string;
    tracking_id?: string;
    coins_redeemed?: number;
    coins_earned?: number;
    coins_credited?: boolean;
    payment_method?: string;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    fox_coins: number;
    updated_at: string;
}

export interface CoinTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'earned' | 'redeemed' | 'refund';
    order_id?: string;
    description: string;
    created_at: string;
}

export interface OrderItem {
    product_id: string;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
}

export interface Ad {
    id: string;
    image_url: string;
    active: boolean;
    created_at: string;
}

export interface TshirtColor {
    id: string;
    name: string;
    hex_code: string;
    available: boolean;
    created_at: string;
}

export interface CustomOrderItem {
    type: 'men' | 'women' | 'couple';
    color: string;
    color_name: string;
    men_size?: string;
    women_size?: string;
    front_image_men?: string;
    back_image_men?: string;
    front_image_women?: string;
    back_image_women?: string;
    quantity: number;
    price: number;
}

export interface CustomTshirtPrice {
    id: string;
    title: string;
    price: number;
    created_at: string;
}
