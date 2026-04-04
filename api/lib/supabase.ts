import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are required.');
    }

    // Ensure URL has protocol
    if (!supabaseUrl.startsWith('http')) {
      supabaseUrl = `https://${supabaseUrl}`;
    }
    
    // Fix common mistake where .com is used instead of .co
    if (supabaseUrl.endsWith('.supabase.com')) {
      supabaseUrl = supabaseUrl.replace('.supabase.com', '.supabase.co');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseInstance;
}

// For backward compatibility during refactoring
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

export async function getUser(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase();
    
    // Check if we can reach Supabase before calling auth.getUser
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      if (error) console.error('[Supabase Auth Error]', error.message);
      return null;
    }
    return user;
  } catch (err: any) {
    console.error('[getUser Error]', err.message);
    // If it's a fetch failure, we want to know why
    if (err.name === 'TypeError' && err.message === 'fetch failed') {
      console.error('[Critical] Supabase connection failed. Check SUPABASE_URL and network.');
    }
    return null;
  }
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function handleOptions() {
  return new Response(null, { headers: corsHeaders() });
}
