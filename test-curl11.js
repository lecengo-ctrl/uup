import http from 'http';

const routes = [
  '/api/apps',
  '/api/apps/detail?id=1',
  '/api/config',
  '/api/profile',
  '/api/sync',
  '/api/bookmarks',
  '/api/notifications',
  '/api/transactions',
  '/api/comments?appId=1',
  '/api/demands',
  '/api/recognitions?appId=1',
  '/api/purchase'
];

routes.forEach(route => {
  http.get(`http://127.0.0.1:3000${route}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('import { s')) {
        console.log(`FOUND IN ROUTE: ${route}`);
        console.log(data.substring(0, 100));
      }
    });
  });
});
