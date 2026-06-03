import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** @type {any} */
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    /**
     * Production-grade Supabase configuration
     * - persistSession: true - Maintains session across page reloads
     * - autoRefreshToken: true - Automatically refreshes tokens before expiry
     * - detectSessionInUrl: true - Detects session from URL (OAuth flows)
     * - storage: localStorage - Persists session in browser storage
     */
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'icon_by_mitali_auth',
        flowType: 'pkce'
      },
      // Optional: Configure realtime for multi-tab awareness
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    
    console.log('✅ Supabase client initialized with production config');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase credentials not configured. Frontend will work without backend.');
  // Create a mock client that includes all necessary methods
  supabase = {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      insert: async () => ({ data: [], error: null }),
      update: async () => ({ data: [], error: null }),
      delete: async () => ({ data: [], error: null }),
    }),
    auth: {
      user: null,
      onAuthStateChange: (callback) => {
        // Return unsubscribe function
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => ({ data: null, error: { message: 'Auth not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Auth not configured' } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: null, error: null }),
    },
  };
}

export { supabase };
