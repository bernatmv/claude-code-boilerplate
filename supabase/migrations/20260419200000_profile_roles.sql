-- Adds a role column to profiles for simple RBAC (user | admin).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);

-- Prevent self-escalation: users can update their profile but not their role.
-- The service role bypasses RLS and triggers run in the session's role, so
-- admin tooling using the service role can still change roles.
CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND current_setting('request.jwt.claim.role', TRUE) <> 'service_role' THEN
    RAISE EXCEPTION 'role changes are not permitted from the client';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_self_update ON public.profiles;
CREATE TRIGGER prevent_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();
