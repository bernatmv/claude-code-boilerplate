"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resetPasswordSchema, signInSchema, signUpSchema } from "@repo/validation";

import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/emails/templates";
import { getAuthRateLimiter, getClientIp } from "@/lib/ratelimit";
import { site } from "@/lib/site";
import { createServerClient } from "@/lib/supabase/server";

async function checkAuthRateLimit(): Promise<AuthState | null> {
  const ip = getClientIp(await headers());
  const { success } = await getAuthRateLimiter().limit(`ip:${ip}`);
  if (!success) return { error: "Too many attempts. Try again in a minute." };
  return null;
}

export type AuthState = { ok?: boolean; error?: string } | null;

function fieldErrors(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await checkAuthRateLimit();
  if (limited) return limited;
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect("/profile");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const limited = await checkAuthRateLimit();
  if (limited) return limited;
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  void sendEmail({
    to: parsed.data.email,
    ...welcomeEmail({ appName: site.name, signInUrl: `${site.url}/sign-in` }),
  }).catch(() => undefined);
  return { ok: true };
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const limited = await checkAuthRateLimit();
  if (limited) return limited;
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
  if (error) return { error: fieldErrors(error) };
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
