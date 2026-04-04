async function test() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/apps');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body start:', text.substring(0, 50));
  } catch (e) {
    console.error(e);
  }
}
test();
