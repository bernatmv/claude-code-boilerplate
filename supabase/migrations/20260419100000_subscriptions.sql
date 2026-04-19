-- =============================================================================
-- subscriptions
-- Mirrors the Stripe customer + active subscription for each user.
-- Written by the stripe-webhook Edge Function (service role).
-- Read by the owning user for billing UI.
-- =============================================================================
CREATE TABLE public.subscriptions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  stripe_customer_id      TEXT        NOT NULL UNIQUE,
  stripe_subscription_id  TEXT        UNIQUE,
  stripe_price_id         TEXT,
  status                  TEXT        NOT NULL DEFAULT 'incomplete'
                                      CHECK (status IN (
                                        'incomplete','incomplete_expired','trialing','active',
                                        'past_due','canceled','unpaid','paused'
                                      )),
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — mutations go through service role (webhook).

CREATE TRIGGER on_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
