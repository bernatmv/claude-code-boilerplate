import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        Signed in as <strong>{user.email}</strong>
      </p>
      {children}
    </div>
  );
}
