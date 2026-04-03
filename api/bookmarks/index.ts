import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    const { appId } = await req.json();
    
    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .single();

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('app_id', appId);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true, action: 'removed' }), {
        status: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert([{ user_id: user.id, app_id: appId }]);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true, action: 'added' }), {
        status: 201,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
