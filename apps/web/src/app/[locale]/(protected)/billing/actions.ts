"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/database-types";

import { createServerClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Service role credentials missing");
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const admin = adminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });
  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    stripe_customer_id: customer.id,
    status: "incomplete",
  });
  if (error) throw error;
  return customer.id;
}

export async function startCheckoutAction(priceId: string): Promise<void> {
  if (!isStripeConfigured()) throw new Error("Stripe is not configured");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Must be signed in");

  const customerId = await getOrCreateCustomer(user.id, user.email);
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl()}/billing?status=success`,
    cancel_url: `${siteUrl()}/billing?status=canceled`,
    allow_promotion_codes: true,
    client_reference_id: user.id,
  });
  if (!session.url) throw new Error("Checkout session missing URL");
  redirect(session.url);
}

export async function openPortalAction(): Promise<void> {
  if (!isStripeConfigured()) throw new Error("Stripe is not configured");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  const admin = adminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) throw new Error("No customer record");

  const portal = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl()}/billing`,
  });
  redirect(portal.url);
}
