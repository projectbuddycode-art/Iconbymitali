import { supabase } from './supabaseClient';

/**
 * Admin utilities for Supabase operations
 * Production-grade CRUD operations with proper error handling and FK relationships
 */

// ============= ERROR HANDLING UTILITIES =============

/**
 * Format Supabase errors for user display
 */
function formatError(error) {
  if (!error) return 'An unknown error occurred';
  
  if (error.message?.includes('collection')) {
    return 'Collection not found or invalid. Please select a valid collection.';
  }
  
  if (error.code === '23505') {
    return 'This item already exists. Please use a unique value.';
  }
  
  if (error.code === '23503') {
    return 'Referenced item not found. Please check your selection.';
  }
  
  if (error.code === '42501') {
    return 'You do not have permission to perform this action.';
  }
  
  return error.message || 'An error occurred while processing your request.';
}

/**
 * Log errors consistently
 */
function logError(operation, error, context = null) {
  console.error(`❌ [${operation}] ${error.message}`, {
    code: error.code,
    context,
    fullError: error
  });
}

// ============= COLLECTIONS =============

export const adminCollections = {
  async list() {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      console.log('✅ Collections loaded:', data?.length);
      return data || [];
    } catch (error) {
      logError('listCollections', error);
      throw new Error(formatError(error));
    }
  },

  async get(id) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logError('getCollection', error, { id });
      throw new Error(formatError(error));
    }
  },

  async create(collectionData) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([{
          ...collectionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Collection created:', data?.id);
      return data;
    } catch (error) {
      logError('createCollection', error, collectionData);
      throw new Error(formatError(error));
    }
  },

  async update(id, collectionData) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .update({
          ...collectionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Collection updated:', id);
      return data;
    } catch (error) {
      logError('updateCollection', error, { id, collectionData });
      throw new Error(formatError(error));
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log('✅ Collection deleted:', id);
    } catch (error) {
      logError('deleteCollection', error, { id });
      throw new Error(formatError(error));
    }
  }
};

// ============= PRODUCTS =============

export const adminProducts = {
  async list(sortBy = 'created_at') {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          collections:collection_id(*)
        `)
        .order(sortBy, { ascending: false });
      
      if (error) throw error;
      console.log('✅ Products loaded:', data?.length);
      return data || [];
    } catch (error) {
      logError('listProducts', error, { sortBy });
      throw new Error(formatError(error));
    }
  },

  async get(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          collections:collection_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logError('getProduct', error, { id });
      throw new Error(formatError(error));
    }
  },

  async create(productData) {
    try {
      if (productData.collection_id) {
        const collection = await adminCollections.get(productData.collection_id);
        if (!collection) throw new Error('Invalid collection_id');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Product created:', data?.id);
      return data;
    } catch (error) {
      logError('createProduct', error, productData);
      throw new Error(formatError(error));
    }
  },

  async update(id, productData) {
    try {
      if (productData.collection_id) {
        const collection = await adminCollections.get(productData.collection_id);
        if (!collection) throw new Error('Invalid collection_id');
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Product updated:', id);
      return data;
    } catch (error) {
      logError('updateProduct', error, { id, productData });
      throw new Error(formatError(error));
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log('✅ Product deleted:', id);
    } catch (error) {
      logError('deleteProduct', error, { id });
      throw new Error(formatError(error));
    }
  },

  async uploadImage(file) {
    try {
      if (!file) throw new Error('No file provided');
      
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(`images/${fileName}`, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(`images/${fileName}`);
      
      console.log('✅ Image uploaded:', fileName);
      return publicUrl;
    } catch (error) {
      logError('uploadImage', error, { fileName: file?.name });
      throw new Error(formatError(error));
    }
  }
};

// ============= ORDERS =============

export const adminOrders = {
  async list(sortBy = '-created_at') {
    try {
      const orderConfig = sortBy.startsWith('-') 
        ? { column: sortBy.slice(1), ascending: false }
        : { column: sortBy, ascending: true };
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order(orderConfig.column, { ascending: orderConfig.ascending });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      logError('listOrders', error, { sortBy });
      throw new Error(formatError(error));
    }
  },

  async get(id) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logError('getOrder', error, { id });
      throw new Error(formatError(error));
    }
  },

  async updateStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Order status updated:', id);
      return data;
    } catch (error) {
      logError('updateOrderStatus', error, { id, status });
      throw new Error(formatError(error));
    }
  },

  async updatePaymentStatus(id, paymentStatus) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logError('updatePaymentStatus', error, { id, paymentStatus });
      throw new Error(formatError(error));
    }
  },

  async updateTrackingAwb(id, awb) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ shiprocket_awb: awb, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logError('updateTrackingAwb', error, { id, awb });
      throw new Error(formatError(error));
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log('✅ Order deleted:', id);
    } catch (error) {
      logError('deleteOrder', error, { id });
      throw new Error(formatError(error));
    }
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
      .select(`
        *,
        collections:collection_id(id, name)
      `)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('knitwear_items')
      .select(`
        *,
        collections:collection_id(id, name)
      `)
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
