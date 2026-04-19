import { createServerClient } from "@/lib/supabase/server";

export type Role = "user" | "admin";

export async function getCurrentRole(): Promise<Role | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<{
    role: Role;
  }>();
  return data?.role ?? "user";
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "admin";
}
