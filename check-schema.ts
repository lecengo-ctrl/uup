import { supabase } from './api/lib/supabase';

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profile keys:', Object.keys(data[0] || {}));
  }
}

checkSchema();
