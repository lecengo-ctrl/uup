import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort');
    const authorId = url.searchParams.get('authorId');

    let query = supabase
      .from('apps')
      .select('*, profiles(nickname, avatar)');

    // Visibility filtering
    if (authorId) {
      // If authorId is specified, only show public apps unless it's the author themselves
      if (user && user.id === authorId) {
        query = query.eq('user_id', authorId);
      } else {
        query = query.eq('user_id', authorId).eq('visibility', 'public');
      }
    } else {
      // General listing: only public online apps
      query = query.eq('visibility', 'public').eq('status', 'online');
    }

    if (category && category !== '全部') {
      query = query.contains('tags', [category]);
    }

    // Sorting
    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'heat') {
      query = query.order('views', { ascending: false });
    } else if (sort === 'recognition') {
      // Simplified: order by views for now, or we'd need a calculated field
      query = query.order('views', { ascending: false });
    }

    const { data, error } = await query;

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

    const body = await req.json();
    const { data, error } = await supabase
      .from('apps')
      .insert([{ ...body, user_id: user.id }])
      .select()
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
