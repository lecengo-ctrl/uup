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
      .from('recognitions')
      .select('*')
      .eq('app_id', appId);

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

    const { appId, type } = await req.json();
    
    // Check if already recognized
    const { data: existing } = await supabase
      .from('recognitions')
      .select('*')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .eq('type', type)
      .single();

    if (existing) {
      // Remove recognition
      const { error } = await supabase
        .from('recognitions')
        .delete()
        .eq('user_id', user.id)
        .eq('app_id', appId)
        .eq('type', type);

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
      // Add recognition
      const { error } = await supabase
        .from('recognitions')
        .insert([{ user_id: user.id, app_id: appId, type }]);

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
