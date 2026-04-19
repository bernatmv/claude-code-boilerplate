// Supabase Edge Function: stripe-webhook
// Verifies the Stripe signature and mirrors subscription events into `subscriptions`.
//
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
// (JWT verification OFF — we verify the Stripe signature ourselves.)

// deno-lint-ignore-file no-explicit-any
// @ts-expect-error: remote import resolved by Deno
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-expect-error: remote import resolved by Deno
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
// @ts-expect-error: remote import resolved by Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.3";

declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("Missing env", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-04-30.basil" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  const body = await req.text();
  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Invalid signature: ${(err as Error).message}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  async function syncSubscription(subscription: any): Promise<void> {
    const customerId: string = subscription.customer;
    const priceId: string | null = subscription.items?.data?.[0]?.price?.id ?? null;
    await admin
      .from("subscriptions")
      .update({
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      })
      .eq("stripe_customer_id", customerId);
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(sub);
      }
      break;
    }
    default:
      // unhandled events are acknowledged without mutation
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "content-type": "application/json" },
  });
});
