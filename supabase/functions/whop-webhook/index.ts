import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'jsr:@supabase/server@1';
import { Whop } from 'npm:@whop/sdk@0.0.42';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

function firstValue<T>(...values: Array<T | null | undefined>): T | null {
  return values.find((value) => value !== null && value !== undefined) ?? null;
}

export default {
  fetch: withSupabase({ auth: 'none' }, async (request, context) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const whopApiKey = Deno.env.get('WHOP_API_KEY');
  const whopWebhookSecret = Deno.env.get('WHOP_WEBHOOK_SECRET');
  const whopCompanyId = Deno.env.get('WHOP_COMPANY_ID');

  if (!whopApiKey || !whopWebhookSecret || !whopCompanyId) {
    return json({ error: 'Server configuration is incomplete' }, 500);
  }

  try {
    const rawBody = await request.text();
    const whop = new Whop({
      apiKey: whopApiKey,
      webhookKey: btoa(whopWebhookSecret)
    });
    const event = whop.webhooks.unwrap(rawBody, {
      headers: Object.fromEntries(request.headers)
    }) as Record<string, any>;

    if (event.company_id && event.company_id !== whopCompanyId) {
      return json({ error: 'Company mismatch' }, 403);
    }

    if (event.type !== 'payment.succeeded') {
      return json({ received: true, ignored: event.type });
    }

    const payment = event.data || {};
    const whopProductId = firstValue(
      payment.product?.id,
      payment.plan?.product?.id,
      payment.membership?.product?.id,
      payment.access_pass?.id
    );
    let membership: Record<string, any> | null = null;
    if (payment.membership?.id) {
      try {
        membership = await whop.memberships.retrieve(payment.membership.id) as Record<string, any>;
      } catch (error) {
        console.warn('Membership details are unavailable', error);
      }
    }

    const email = firstValue(
      payment.user?.email,
      membership?.user?.email,
      payment.member?.email,
      payment.member?.user?.email
    );

    if (!payment.id || !email) {
      return json({ error: 'Payment ID or customer email is missing' }, 422);
    }

    const supabase = context.supabaseAdmin;

    let localProduct: { id: string; name: string } | null = null;
    if (whopProductId) {
      const { data } = await supabase
        .from('products')
        .select('id,name')
        .eq('whop_product_id', whopProductId)
        .maybeSingle();
      localProduct = data;
    }

    const total = Number(firstValue(payment.total, payment.usd_total, 0));
    const itemName = firstValue(
      localProduct?.name,
      payment.product?.title,
      payment.plan?.product?.title,
      'Produs Whop'
    );
    const member = payment.member || membership?.member || {};
    const user = payment.user || membership?.user || member.user || {};
    const shippingAddress = firstValue(
      payment.shipping_address,
      payment.shipping_details,
      member.shipping_address,
      payment.billing_address,
      null
    );
    const customFieldResponses = firstValue(
      membership?.custom_field_responses,
      payment.custom_field_responses,
      []
    );

    const order = {
      whop_payment_id: payment.id,
      whop_membership_id: firstValue(payment.membership?.id, member.membership_id),
      whop_product_id: whopProductId,
      customer_email: String(email).trim().toLowerCase(),
      customer_name: firstValue(user.name, member.name, shippingAddress?.name),
      customer_phone: firstValue(member.phone, user.phone, payment.phone),
      shipping_address: shippingAddress,
      custom_fields: {
        payment_metadata: firstValue(payment.metadata, {}),
        responses: customFieldResponses
      },
      items: [{
        product_id: localProduct?.id ?? null,
        name: itemName,
        price: total,
        quantity: 1
      }],
      subtotal: Number(firstValue(payment.subtotal, total)),
      total,
      currency: String(firstValue(payment.currency, 'usd')).toLowerCase(),
      status: 'paid',
      paid_at: firstValue(payment.paid_at, payment.created_at, new Date().toISOString())
    };

    const { error } = await supabase
      .from('orders')
      .upsert(order, { onConflict: 'whop_payment_id', ignoreDuplicates: true });

    if (error) throw error;
    return json({ received: true, payment_id: payment.id });
  } catch (error) {
    console.error('Whop webhook error', error);
    return json({ error: 'Invalid webhook or database failure' }, 400);
  }
  })
};
