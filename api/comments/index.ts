import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);
  const url = new URL(req.url);
  const appId = url.searchParams.get('appId');

  if (req.method === 'GET') {
    if (!appId) return new Response('Missing appId', { status: 400 });

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(nickname, avatar)')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

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
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { appId, content, replyToId } = await req.json();
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        app_id: appId,
        content,
        reply_to_id: replyToId,
        user_id: user.id
      }])
      .select('*, profiles(nickname, avatar)')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
