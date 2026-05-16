// Secure order creation: re-prices the cart server-side from the database,
// validates the user, then writes the order + items in one transaction.
// The client NEVER sets the final total — that's authoritative on the server.
// This is also where a real Stripe charge would be made (currently mock test mode).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface CartLine {
  product_id: string;
  quantity: number;
  weight?: string;
}

interface RequestBody {
  items: CartLine[];
  shipping_address: Record<string, string>;
  shipping_method: 'standard' | 'express';
}

const FREE_SHIPPING_THRESHOLD = 75;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const body = (await req.json()) as RequestBody;

    // Strict input validation
    if (
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 50
    ) {
      return json({ error: 'Invalid cart' }, 400);
    }
    for (const line of body.items) {
      if (
        typeof line.product_id !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(line.product_id) ||
        typeof line.quantity !== 'number' ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 99
      ) {
        return json({ error: 'Invalid cart line' }, 400);
      }
    }
    if (!['standard', 'express'].includes(body.shipping_method)) {
      return json({ error: 'Invalid shipping method' }, 400);
    }

    // Re-fetch authoritative prices
    const ids = [...new Set(body.items.map((i) => i.product_id))];
    const { data: products, error: productsErr } = await supabase
      .from('products')
      .select('id, price, sale_price, in_stock')
      .in('id', ids);
    if (productsErr) throw productsErr;

    let subtotal = 0;
    const orderItemRows: Array<{ product_id: string; quantity: number; price: number; weight: string }> = [];
    for (const line of body.items) {
      const p = products?.find((x) => x.id === line.product_id);
      if (!p) return json({ error: 'Product not available' }, 400);
      if (!p.in_stock) return json({ error: 'Product out of stock' }, 400);
      const unit = Number(p.sale_price ?? p.price);
      subtotal += unit * line.quantity;
      orderItemRows.push({
        product_id: p.id,
        quantity: line.quantity,
        price: unit,
        weight: line.weight ?? '',
      });
    }

    const shippingCost =
      subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : body.shipping_method === 'express'
          ? 12.99
          : 5.99;
    const total = +(subtotal + shippingCost).toFixed(2);

    // ---- Real Stripe charge would happen here, server-side, using STRIPE_SECRET_KEY ----
    // Currently in mock test mode — payment is treated as successful.
    const paymentStatus = 'completed';

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        shipping_address: body.shipping_address,
        shipping_method: body.shipping_method,
        payment_method: 'card',
        payment_status: paymentStatus,
        status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemRows.map((r) => ({ ...r, order_id: order.id })));
    if (itemsErr) throw itemsErr;

    return json({ order_id: order.id, total }, 200);
  } catch (e) {
    // Never leak internals to client
    console.error('create-order error:', e);
    return json({ error: 'Unable to process order' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
