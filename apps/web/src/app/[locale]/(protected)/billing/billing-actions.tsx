"use client";

import { useTransition } from "react";

import { openPortalAction, startCheckoutAction } from "./actions";

export function BillingActions({
  hasSubscription,
  priceId,
}: {
  hasSubscription: boolean;
  priceId: string;
}) {
  const [pending, startTransition] = useTransition();

  if (hasSubscription) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => openPortalAction())}
        className="self-start rounded-md bg-brand-500 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "…" : "Manage billing"}
      </button>
    );
  }

  if (!priceId) {
    return (
      <p className="text-sm text-neutral-600">
        Set <code>NEXT_PUBLIC_STRIPE_PRICE_ID</code> to enable checkout.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => startCheckoutAction(priceId))}
      className="self-start rounded-md bg-brand-500 px-4 py-2 text-white disabled:opacity-60"
    >
      {pending ? "…" : "Subscribe"}
    </button>
  );
}
