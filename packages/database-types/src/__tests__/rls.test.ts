/**
 * RLS integration test — skips the entire suite when SUPABASE_URL is not set or the
 * instance is unreachable.  This keeps CI green in the boilerplate repo which ships
 * without a live Supabase project.
 *
 * Downstream projects that run `pnpm db:types` and set SUPABASE_URL / SUPABASE_ANON_KEY /
 * SUPABASE_SERVICE_ROLE_KEY in .env.local will exercise these tests for real.
 *
 * Note: clients are typed with `Record<string, unknown>` instead of the generated
 * `Database` type so that this file compiles against the placeholder type shipped in
 * the boilerplate.  Downstream projects should replace this with `Database` once real
 * types are generated.
 */
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Skip the entire suite when Supabase credentials are not configured or unreachable.
const supabaseReachable =
  !!SUPABASE_URL &&
  !!ANON_KEY &&
  !!SERVICE_ROLE_KEY &&
  (await fetch(`${SUPABASE_URL}/auth/v1/health`)
    .then((r) => r.ok)
    .catch(() => false));

// Use untyped clients so this file compiles against the placeholder Database type.
// Downstream projects with real generated types can add <Database> here.
const anon = SUPABASE_URL
  ? createClient(SUPABASE_URL, ANON_KEY)
  : (null as unknown as ReturnType<typeof createClient>);
const service = SUPABASE_URL
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : (null as unknown as ReturnType<typeof createClient>);

describe.skipIf(!supabaseReachable)(
  "RLS — skipped when SUPABASE_URL not set or unreachable",
  () => {
    const TEST_ITEM_TITLE = "__rls_test_item__";
    let testUserId: string | null = null;

    beforeAll(async () => {
      const { data, error } = await service.auth.admin.createUser({
        email: `rls-test-${Date.now()}@example.com`,
        password: "test-password-123",
        email_confirm: true,
      });
      if (error) throw error;
      testUserId = data.user.id;
      await service.from("items").insert({ user_id: testUserId, title: TEST_ITEM_TITLE });
    });

    afterAll(async () => {
      if (testUserId) {
        await service.from("items").delete().eq("title", TEST_ITEM_TITLE);
        await service.auth.admin.deleteUser(testUserId);
      }
    });

    it("anon client gets empty rows from items (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("items").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("anon client gets empty rows from profiles (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("profiles").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("anon client gets empty rows from push_tokens (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("push_tokens").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("service role bypasses RLS and reads the test item", async () => {
      const { data, error } = await service
        .from("items")
        .select("id, user_id")
        .eq("title", TEST_ITEM_TITLE);
      expect(error).toBeNull();
      expect((data as { id: string; user_id: string }[]).length).toBeGreaterThan(0);
      expect(
        (data as { id: string; user_id: string }[]).every((row) => row.user_id === testUserId),
      ).toBe(true);
    });
  },
);
