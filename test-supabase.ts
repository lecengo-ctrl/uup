import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://invalid.local', 'dummy');
async function run() {
  try {
    const res = await supabase.from('apps').select('*');
    console.log(res);
  } catch (e) {
    console.error('THROWN:', e);
  }
}
run();
