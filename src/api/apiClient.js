import { supabase } from '@/api/supabaseClient';

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) throw error;
  return data;
};

export const getLookbookProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('show_in_lookbook', true);
  
  if (error) throw error;
  return data;
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const createRazorpayOrder = async (amount) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ amount }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to create Razorpay order');
  }
  
  return response.json();
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(paymentData),
    }
  );
  
  if (!response.ok) {
    throw new Error('Payment verification failed');
  }
  
  return response.json();
};

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// ─── Page Settings ───────────────────────────────────────────────────────────
export const getPageSettings = async (pageName) => {
  const { data, error } = await supabase
    .from('page_settings')
    .select('*')
    .eq('page_name', pageName);
  
  if (error) throw error;
  return data;
};

// ─── Orders Tracking ─────────────────────────────────────────────────────────
export const getOrderDetails = async (orderId) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-shipment-details`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ orderId }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch order details');
  }
  
  return response.json();
};

export const trackShipment = async (shipmentId) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shiprocket-track`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ shipmentId }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to track shipment');
  }
  
  return response.json();
};

// ─── Wishlist (localStorage) ─────────────────────────────────────────────────
// Stored as an array of product IDs in localStorage under 'icon_wishlist'

const WISHLIST_KEY = 'icon_wishlist';

export const getWishlist = () =>
  JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');

export const addToWishlist = (productId) => {
  const list = getWishlist();
  if (!list.includes(productId)) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...list, productId]));
  }
};

export const removeFromWishlist = (productId) => {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(getWishlist().filter((id) => id !== productId))
  );
};

export const isInWishlist = (productId) => getWishlist().includes(productId);