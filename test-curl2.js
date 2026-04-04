import http from 'http';
http.get('http://127.0.0.1:3000/api/apps/detail?id=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data.substring(0, 100)));
});
