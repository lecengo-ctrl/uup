import { supabase, getUser, corsHeaders, handleOptions } from '../lib/supabase';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return handleOptions();

  const user = await getUser(req);
  if (!user) return new Response('Unauthorized', { status: 401 });

  if (req.method === 'POST') {
    const { appId } = await req.json();
    
    // 1. Get app price
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('price, title')
      .eq('id', appId)
      .single();

    if (appError || !app) {
      return new Response(JSON.stringify({ error: 'App not found' }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 2. Get user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    if (profile.balance < app.price) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // 3. Perform transaction (simplified, should be a database function/transaction)
    // Deduct balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - app.price })
      .eq('id', user.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Create transaction record
    const { error: transError } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        amount: -app.price,
        type: 'purchase',
        description: `购买应用: ${app.title}`,
        status: 'completed'
      }]);

    if (transError) {
      // Note: Ideally we'd rollback the balance update here
      return new Response(JSON.stringify({ error: transError.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
