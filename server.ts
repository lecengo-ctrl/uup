import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// API Handlers
import appsHandler from './api/apps/index';
import appDetailHandler from './api/apps/detail';
import configHandler from './api/config/index';
import profileHandler from './api/profile/index';
import syncHandler from './api/sync/index';
import bookmarksHandler from './api/bookmarks/index';
import notificationsHandler from './api/notifications/index';
import transactionsHandler from './api/transactions/index';
import commentsHandler from './api/comments/index';
import demandsHandler from './api/demands/index';
import recognitionsHandler from './api/recognitions/index';
import purchaseHandler from './api/purchase/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', async (req, res) => {
    let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    let connectivity = 'unknown';
    
    if (supabaseUrl) {
      // Fix common mistake where .com is used instead of .co
      if (supabaseUrl.endsWith('.supabase.com')) {
        supabaseUrl = supabaseUrl.replace('.supabase.com', '.supabase.co');
      }
      try {
        const response = await fetch(supabaseUrl, { method: 'HEAD' });
        connectivity = response.ok ? 'ok' : `error: ${response.status}`;
      } catch (err: any) {
        connectivity = `failed: ${err.message}`;
      }
    }

    res.json({ 
      status: 'ok', 
      supabase: {
        configured: !!supabaseUrl,
        connectivity
      },
      env: {
        SUPABASE_URL: !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_ANON_KEY || !!process.env.VITE_SUPABASE_ANON_KEY
      }
    });
  });

  // Helper to convert Vercel handler to Express handler
  const vercelToExpress = (handler: any) => async (req: express.Request, res: express.Response) => {
    try {
      // Create a Request object from Express request
      // Use 127.0.0.1 for internal routing to avoid IPv6/IPv4 resolution issues
      const url = `http://127.0.0.1:3000${req.originalUrl}`;
      
      // Filter out headers that might cause issues with the Request constructor
      const safeHeaders = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value && !['host', 'content-length', 'connection', 'expect'].includes(key.toLowerCase())) {
          if (Array.isArray(value)) {
            value.forEach(v => safeHeaders.append(key, v));
          } else {
            safeHeaders.set(key, value);
          }
        }
      });

      const request = new Request(url, {
        method: req.method,
        headers: safeHeaders,
        body: (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) 
          ? JSON.stringify(req.body) 
          : undefined,
      });

      const response = await handler(request);
      
      // Copy headers
      response.headers.forEach((value: string, key: string) => {
        res.setHeader(key, value);
      });

      res.status(response.status);
      
      if (response.status === 204) {
        res.end();
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // API Routes
  app.use('/api', (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.all('/api/apps', vercelToExpress(appsHandler));
  app.all('/api/apps/detail', vercelToExpress(appDetailHandler));
  app.all('/api/config', vercelToExpress(configHandler));
  app.all('/api/profile', vercelToExpress(profileHandler));
  app.all('/api/sync', vercelToExpress(syncHandler));
  app.all('/api/bookmarks', vercelToExpress(bookmarksHandler));
  app.all('/api/notifications', vercelToExpress(notificationsHandler));
  app.all('/api/notifications/read-all', vercelToExpress(notificationsHandler));
  app.all('/api/transactions', vercelToExpress(transactionsHandler));
  app.all('/api/comments', vercelToExpress(commentsHandler));
  app.all('/api/demands', vercelToExpress(demandsHandler));
  app.all('/api/recognitions', vercelToExpress(recognitionsHandler));
  app.all('/api/purchase', vercelToExpress(purchaseHandler));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
