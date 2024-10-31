import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_PROJECT_URL');
  if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_API_KEY');
  throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
  },
  global: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
