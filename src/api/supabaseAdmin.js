import { supabase } from './supabaseClient';

/**
 * Admin utilities for Supabase operations
 * Handles all admin CRUD operations for products, orders, blog, coupons, etc.
 */

// ============= PRODUCTS =============

export const adminProducts = {
  async list(sortBy = 'created_at') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order(sortBy, { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('products')
      .upload(`images/${fileName}`, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(`images/${fileName}`);
    
    return publicUrl;
  }
};

// ============= ORDERS =============

export const adminOrders = {
  async list(sortBy = '-created_at') {
    const orderBy = sortBy.startsWith('-') 
      ? { column: sortBy.slice(1), ascending: false }
      : { column: sortBy, ascending: true };
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTrackingAwb(id, awb) {
    const { data, error } = await supabase
      .from('orders')
      .update({ shiprocket_awb: awb, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============= BLOG POSTS =============

export const adminBlogPosts = {
  async list(sortBy = '-created_at') {
    const orderBy = sortBy.startsWith('-') 
      ? { column: sortBy.slice(1), ascending: false }
      : { column: sortBy, ascending: true };
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(postData) {
    // Generate slug from title if not provided
    const slug = postData.slug || postData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...postData, slug }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, postData) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('blog')
      .upload(`images/${fileName}`, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('blog')
      .getPublicUrl(`images/${fileName}`);
    
    return publicUrl;
  }
};

// ============= COUPONS =============

export const adminCoupons = {
  async list() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        ...couponData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, couponData) {
    const { data, error } = await supabase
      .from('coupons')
      .update(couponData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleActive(id, isActive) {
    return this.update(id, { is_active: isActive });
  }
};

// ============= KNITWEAR ITEMS =============

export const adminKnitwearItems = {
  async list() {
    const { data, error } = await supabase
      .from('knitwear_items')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('knitwear_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(itemData) {
    const { data, error } = await supabase
      .from('knitwear_items')
      .insert([itemData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, itemData) {
    const { data, error } = await supabase
      .from('knitwear_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('knitwear_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('products')
      .upload(`knitwear/${fileName}`, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(`knitwear/${fileName}`);
    
    return publicUrl;
  }
};

// ============= CONTACTS =============

export const adminContacts = {
  async list() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markAsRead(id) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export default {
  products: adminProducts,
  orders: adminOrders,
  blogPosts: adminBlogPosts,
  coupons: adminCoupons,
  knitwearItems: adminKnitwearItems,
  contacts: adminContacts
};
