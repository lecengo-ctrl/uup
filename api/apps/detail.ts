import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing ID', { status: 400 });

  const user = await getUser(req);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('apps')
      .select('*, profiles(nickname, avatar)')
      .eq('id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Increment views if it's a GET request
    await supabase.rpc('increment_views', { app_id: id });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'PATCH') {
    if (!user) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    
    // Security check: only author or admin can update
    const { data: appData } = await supabase.from('apps').select('user_id').eq('id', id).single();
    if (!appData || appData.user_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('apps')
      .update(body)
      .eq('id', id)
      .select()
      .single();

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

  if (req.method === 'DELETE') {
    if (!user) return new Response('Unauthorized', { status: 401 });

    // Security check: only author or admin can delete
    const { data: appData } = await supabase.from('apps').select('user_id').eq('id', id).single();
    if (!appData || appData.user_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!profile || profile.role !== 'admin') {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
