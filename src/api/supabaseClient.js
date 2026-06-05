import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration:');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Key:', supabaseKey ? '✅ Set' : '❌ Missing');

/** @type {any} */
let supabase = null;

// Mock client factory for fallback
const createMockClient = () => ({
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
  }),
  auth: {
    user: null,
    onAuthStateChange: (callback) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async () => ({ data: null, error: { message: 'Auth not configured' } }),
    signUp: async () => ({ data: null, error: { message: 'Auth not configured' } }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: null, error: null }),
  },
  functions: {
    invoke: async (functionName, options) => {
      console.error(`❌ Edge function '${functionName}' called but Supabase is not initialized`);
      return { 
        data: null, 
        error: { 
          message: `Edge function '${functionName}' is not available. Supabase credentials may not be configured.` 
        } 
      };
    }
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Storage not configured' } }),
      getPublicUrl: () => ({ data: null, error: { message: 'Storage not configured' } }),
    })
  }
});

if (supabaseUrl && supabaseKey) {
  try {
    console.log('✅ Initializing Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    console.warn('⚠️ Using mock client as fallback');
    supabase = createMockClient();
  }
} else {
  console.warn('⚠️ Supabase credentials not configured. Using mock client.');
  console.warn('⚠️ Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  supabase = createMockClient();
}

export { supabase };
