import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseUrl.endsWith('.supabase.com')) {
  supabaseUrl = supabaseUrl.replace('.supabase.com', '.supabase.co');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function run() {
  try {
    const res = await supabase.from('apps').select('*').limit(1);
    console.log(res);
  } catch (e) {
    console.error('THROWN:', e);
  }
}
run();
