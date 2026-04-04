async function run() {
  try {
    const res = await fetch('https://jeespeznteskyufxwmef.supabase.com', { method: 'HEAD' });
    console.log('Status:', res.status);
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
run();
