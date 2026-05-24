import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** @type {any} */
let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
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
