-- Append-only audit trail. Writes go through the service role; clients never
-- insert directly. Admins can read.
CREATE TABLE public.audit_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  resource   TEXT,
  metadata   JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ip         TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_logs_user_id_created_at_idx
  ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX audit_logs_action_created_at_idx
  ON public.audit_logs (action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only read (admins determined by profiles.role).
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
