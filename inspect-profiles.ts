import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseUrl.endsWith('.supabase.com')) {
  supabaseUrl = supabaseUrl.replace('.supabase.com', '.supabase.co');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable() {
  // Try to fetch one row to see columns
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    // If empty, try to insert a dummy and see what fails or check error message
    console.log('Table is empty. Trying to insert dummy to see schema errors...');
    const { error: insertError } = await supabase.from('profiles').insert([{ id: '00000000-0000-0000-0000-000000000000', phone: '1234567890' }]);
    console.log('Insert Error (with phone):', insertError?.message);
  }
}

inspectTable();
