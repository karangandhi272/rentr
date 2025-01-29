import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
