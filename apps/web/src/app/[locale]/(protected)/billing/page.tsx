import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/database-types";

import { createServerClient } from "@/lib/supabase/server";

import { BillingActions } from "./billing-actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { status: urlStatus } = await searchParams;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sub =
    user && url && serviceKey
      ? await createClient<Database>(url, serviceKey, { auth: { persistSession: false } })
          .from("subscriptions")
          .select("status, current_period_end, cancel_at_period_end, stripe_subscription_id")
          .eq("user_id", user.id)
          .maybeSingle()
          .then((r) => r.data)
      : null;

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">Billing</h1>
      {urlStatus === "success" ? (
        <p className="mb-4 rounded-md border border-green-500 bg-green-50 p-3 text-sm">
          Thanks! Your subscription is being activated.
        </p>
      ) : null}
      {urlStatus === "canceled" ? (
        <p className="mb-4 rounded-md border border-neutral-300 p-3 text-sm">Checkout canceled.</p>
      ) : null}

      <div className="flex flex-col gap-4 rounded-md border p-4">
        {!stripeConfigured ? (
          <p className="text-sm text-neutral-600">
            Stripe is not configured. Set <code>STRIPE_SECRET_KEY</code>,{" "}
            <code>STRIPE_WEBHOOK_SECRET</code>, and <code>NEXT_PUBLIC_STRIPE_PRICE_ID</code> to
            enable billing.
          </p>
        ) : (
          <>
            <div className="text-sm">
              <span className="font-medium">Plan status: </span>
              <span>{sub?.status ?? "no subscription"}</span>
              {sub?.current_period_end ? (
                <span className="text-neutral-600">
                  {" "}
                  · renews {new Date(sub.current_period_end).toLocaleDateString()}
                </span>
              ) : null}
              {sub?.cancel_at_period_end ? (
                <span className="text-amber-700"> (cancels at period end)</span>
              ) : null}
            </div>
            <BillingActions
              hasSubscription={Boolean(sub?.stripe_subscription_id)}
              priceId={priceId}
            />
          </>
        )}
      </div>
    </>
  );
}
