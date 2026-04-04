async function testAll() {
  const routes = [
    '/api/apps',
    '/api/apps/detail?id=1',
    '/api/config',
    '/api/profile',
    '/api/bookmarks',
    '/api/notifications',
    '/api/transactions',
    '/api/comments?appId=1',
    '/api/demands',
    '/api/recognitions?appId=1'
  ];
  for (const route of routes) {
    try {
      const res = await fetch(`http://127.0.0.1:3000${route}`);
      const text = await res.text();
      console.log(`Route: ${route}`);
      console.log(`Status: ${res.status}`);
      console.log(`Body start: ${text.substring(0, 50).replace(/\n/g, ' ')}`);
      console.log('---');
    } catch (e) {
      console.error(`Route: ${route} failed`, e);
    }
  }
}
testAll();
