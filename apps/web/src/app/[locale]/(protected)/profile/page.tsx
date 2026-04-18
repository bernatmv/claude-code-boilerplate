import { getTranslations } from "next-intl/server";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileClient } from "@/components/profile-client";
import { createServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const t = await getTranslations("common");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">{t("nav.profile")}</h1>
      {user ? <ProfileClient userId={user.id} /> : null}
      <div className="mt-6">
        <SignOutButton label={t("nav.signOut")} />
      </div>
    </>
  );
}
