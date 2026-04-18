import { getTranslations } from "next-intl/server";

import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function ProfilePage() {
  const t = await getTranslations("common");
  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">{t("nav.profile")}</h1>
      <SignOutButton label={t("nav.signOut")} />
    </>
  );
}
