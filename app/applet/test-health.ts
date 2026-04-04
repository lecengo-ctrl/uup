async function checkHealth() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/health');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
checkHealth();
