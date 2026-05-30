import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FREE_SHIPPING_THRESHOLD = 75;

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

    const body = await req.json();
    const ids = body.items.map((i: any) => i.product_id);
    const { data: products } = await supabase.from('products').select('id, price, sale_price, in_stock').in('id', ids);

    let subtotal = 0;
    for (const line of body.items) {
      const p = products?.find((x: any) => x.id === line.product_id);
      if (!p || !p.in_stock) return json({ error: 'Product not available' }, 400);
      subtotal += Number(p.sale_price ?? p.price) * line.quantity;
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : body.shipping_method === 'express' ? 12.99 : 5.99;
    const total = +(subtotal + shippingCost).toFixed(2);

    // Create PayPal order
    const accessToken = await getPayPalToken();
    const response = await fetch(`${paypalBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: total.toString() } }],
      }),
    });
    const order = await response.json();
    return json({ paypal_order_id: order.id }, 200);
  } catch (e) {
    console.error(e);
    return json({ error: 'Unable to create order' }, 500);
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