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
  // Create a mock client that doesn't throw errors
  supabase = {
    from: () => ({ select: async () => ({ data: [], error: null }) }),
    auth: { user: null }
  };
}

export { supabase };
