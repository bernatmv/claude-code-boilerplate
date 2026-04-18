import { getTranslations } from "next-intl/server";

import { ItemsClient } from "@/components/items-client";
import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const t = await getTranslations("common");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">{t("nav.dashboard")}</h1>
      {user ? <ItemsClient userId={user.id} /> : null}
    </>
  );
}
