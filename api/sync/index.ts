import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  if (req.method === 'POST') {
    const { apps, transactions, bookmarks, notifications } = await req.json();

    // Sync apps
    if (apps && apps.length > 0) {
      const appsToInsert = apps.map((app: any) => ({
        title: app.title,
        description: app.description,
        cover_url: app.coverUrl,
        html_content: app.htmlContent,
        tags: app.tags,
        views: app.views || 0,
        downloads: app.downloads || 0,
        purchases: app.purchases || 0,
        price: app.price || 0,
        allow_download: app.allowDownload || false,
        status: app.status || 'online',
        visibility: app.visibility || 'public',
        user_id: user.id,
        created_at: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
      }));
      await supabase.from('apps').insert(appsToInsert);
    }

    // Sync transactions
    if (transactions && transactions.length > 0) {
      const transactionsToInsert = transactions.map((t: any) => ({
        amount: t.amount,
        type: t.type,
        description: t.description,
        status: t.status || 'completed',
        user_id: user.id,
        created_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      }));
      await supabase.from('transactions').insert(transactionsToInsert);
    }

    // Sync bookmarks
    if (bookmarks && bookmarks.length > 0) {
      const bookmarksToInsert = bookmarks.map((appId: string) => ({
        user_id: user.id,
        app_id: appId,
      }));
      await supabase.from('bookmarks').upsert(bookmarksToInsert, { onConflict: 'user_id,app_id' });
    }

    // Sync notifications
    if (notifications && notifications.length > 0) {
      const notificationsToInsert = notifications.map((n: any) => ({
        type: n.type,
        content: n.content,
        is_read: n.isRead || false,
        user_id: user.id,
        created_at: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
      }));
      await supabase.from('notifications').insert(notificationsToInsert);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
