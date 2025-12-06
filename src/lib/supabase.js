// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  env: import.meta.env
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Supabase configuration is missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get Edge Function URL
export function getEdgeFunctionUrl(functionName) {
  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured!');
  }
  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  console.log(`Edge Function URL for ${functionName}:`, url);
  return url;
}

