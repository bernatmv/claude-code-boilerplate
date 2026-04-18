-- =============================================================================
-- updated_at trigger (reused on every table that needs it)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- profiles
-- Auto-populated by handle_new_user() on auth.users INSERT.
-- =============================================================================
CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- items
-- User-scoped CRUD; RLS enforces owner-only access.
-- =============================================================================
CREATE TABLE public.items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_all_own"
  ON public.items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER on_items_updated
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- push_tokens
-- Upserted on mobile sign-in; identifies per-device Expo push token.
-- =============================================================================
CREATE TABLE public.push_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  device_id   TEXT        NOT NULL,
  expo_token  TEXT        NOT NULL,
  platform    TEXT        NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_all_own"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- push_logs
-- Written exclusively by the send-push Edge Function (service role).
-- No user-level RLS policies — service role bypasses RLS.
-- =============================================================================
CREATE TABLE public.push_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expo_token  TEXT        NOT NULL,
  status      TEXT        NOT NULL,
  message_id  TEXT,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies — only the service role key accesses this table.

-- =============================================================================
-- Example: DB-trigger push on items INSERT (commented — copy/paste in downstream apps)
-- =============================================================================
-- CREATE OR REPLACE FUNCTION public.notify_on_item_insert()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url  := current_setting('app.supabase_url') || '/functions/v1/send-push',
--     body := json_build_object('user_id', NEW.user_id, 'title', 'New item!', 'body', NEW.title)
--   );
--   RETURN NEW;
-- END; $$;
-- CREATE TRIGGER on_item_inserted AFTER INSERT ON public.items
--   FOR EACH ROW EXECUTE FUNCTION public.notify_on_item_insert();
