import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('demands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Fetch profiles manually
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((item: any) => item.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nickname, avatar')
          .in('id', userIds);
        
        if (profilesData) {
          const profileMap = profilesData.reduce((acc: any, profile: any) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          
          data.forEach((item: any) => {
            if (item.user_id && profileMap[item.user_id]) {
              item.profiles = {
                nickname: profileMap[item.user_id].nickname,
                avatar: profileMap[item.user_id].avatar
              };
            }
          });
        }
      }
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
      .from('demands')
      .insert([{ ...body, user_id: user.id }])
      .select('*')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Fetch profile manually
    if (data && data.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nickname, avatar')
        .eq('id', data.user_id)
        .single();
        
      if (profileData) {
        data.profiles = profileData;
      }
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
