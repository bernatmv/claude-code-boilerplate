import { getTranslations } from "next-intl/server";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Open the link in the reset email to set a new password. The callback route is implemented in
        a downstream app.
      </p>
    </>
  );
}
