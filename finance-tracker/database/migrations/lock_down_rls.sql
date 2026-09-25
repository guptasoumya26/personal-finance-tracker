-- ============================================================================
-- Lock down public (anon key) access to the Finance Tracker database
-- ============================================================================
--
-- WHY: the live database has Row Level Security *enabled* but its policies were
-- created as `FOR ALL USING (true) WITH CHECK (true)` with no `TO` clause, so they
-- apply to PUBLIC. Result: anyone holding the public anon key can read, insert,
-- update and delete every row of every table -- including users.password_hash.
--
-- WHAT THIS DOES
--   1. Drops every policy that applies to public / anon / authenticated
--   2. Enables RLS on every table in the public schema
--   3. Ensures the server-side service_role keeps full access
--
-- WHAT THIS DOES NOT DO
--   * It does not revoke table privileges from anon/authenticated (see the
--     optional block at the bottom if you want the stronger version).
--   * It does not touch your data.
--
-- SAFE TO RUN
--   * Wrapped in a transaction: either the whole script applies, or none of it.
--   * Fully idempotent: re-running it is a no-op.
--   * Table-agnostic: it loops over whichever tables exist, so it works whether
--     or not you have already run drop_credit_card_tracker.sql.
--   * The app only ever talks to Supabase with the service_role key from server
--     routes, so it keeps working. Verify afterwards with the queries at the end.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Drop permissive policies (public / anon / authenticated)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  p record;
  dropped int := 0;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles && ARRAY['public', 'anon', 'authenticated']::name[]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      p.policyname, p.schemaname, p.tablename
    );
    dropped := dropped + 1;
    RAISE NOTICE 'dropped policy "%" on %.%', p.policyname, p.schemaname, p.tablename;
  END LOOP;
  RAISE NOTICE 'total permissive policies dropped: %', dropped;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Make sure RLS is actually enabled (dropping policies only helps if it is)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Keep the server-side service_role working
--    (a no-op if service_role already bypasses RLS; guarantees it does not
--     lose access if it relies on policies)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t.tablename
        AND roles && ARRAY['service_role']::name[]
    ) THEN
      EXECUTE format(
        'CREATE POLICY service_role_full_access ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        t.tablename
      );
      RAISE NOTICE 'created service_role_full_access on %', t.tablename;
    END IF;
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION -- expected results are in the comments
-- ============================================================================

-- Every table must report rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: only service_role / service_role_full_access rows remain
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- OPTIONAL (stronger): also revoke table privileges from the public roles.
-- Nothing in this app queries Supabase from the browser, so this is safe here.
-- Uncomment and run separately if you want defence in depth.
-- ============================================================================
-- REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

-- ============================================================================
-- ROLLBACK -- only if the app stops loading data after this script
-- Re-opens access for the service role and stops the bleeding so you can debug.
-- Do NOT leave this in place: it re-exposes everything.
-- ============================================================================
-- DO $$
-- DECLARE t record;
-- BEGIN
--   FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
--   LOOP
--     EXECUTE format(
--       'CREATE POLICY temporary_service_access ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
--       t.tablename
--     );
--   END LOOP;
-- END $$;
