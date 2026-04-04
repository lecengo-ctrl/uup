async function run() {
  try {
    const res = await fetch('https://jeespeznteskyufxwmef.supabase.co', { method: 'HEAD' });
    console.log('Status:', res.status);
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
run();
