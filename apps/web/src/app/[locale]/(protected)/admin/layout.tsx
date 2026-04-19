import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAdmin } from "@/lib/auth/role";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/");
  return (
    <>
      <p className="mb-4 rounded-md border border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Admin area — be careful.
      </p>
      {children}
    </>
  );
}
