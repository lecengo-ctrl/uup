import http from 'http';
http.get('http://127.0.0.1:3000/api/something-else', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data.substring(0, 100)));
});
