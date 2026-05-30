import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData } = await supabase.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const { paypal_order_id, items, shipping_address, shipping_method } = await req.json();

    // Capture payment with PayPal
    const accessToken = await getPayPalToken();
    const response = await fetch(`${paypalBase()}/v2/checkout/orders/${paypal_order_id}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const capture = await response.json();

    if (capture.status !== 'COMPLETED') return json({ error: 'Payment not completed' }, 400);

    const amount = Number(capture.purchase_units[0].payments.captures[0].amount.value);

    // Re-fetch authoritative prices for order items
    const ids = items.map((i: any) => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', ids);

    // Write order to DB
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total: amount,
        shipping_address: shipping_address,
        shipping_method: shipping_method,
        payment_method: 'paypal',
        payment_status: 'completed',
        status: 'confirmed',
        stripe_session_id: paypal_order_id,
      })
      .select().single();
    if (orderErr) throw orderErr;

    // Write order items
    const orderItemRows = items.map((line: any) => {
      const p = products?.find((x: any) => x.id === line.product_id);
      const price = Number(p?.sale_price ?? p?.price ?? 0);
      return {
        order_id: order.id,
        product_id: line.product_id,
        quantity: line.quantity,
        price,
        weight: line.weight ?? '',
      };
    });

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemRows);
    if (itemsErr) throw itemsErr;

    return json({ order_id: order.id }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: 'Unable to capture payment' }, 500);
  }
});

async function getPayPalToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
  const secret = Deno.env.get('PAYPAL_SECRET')!;
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

function paypalBase() {
  return Deno.env.get('PAYPAL_MODE') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}