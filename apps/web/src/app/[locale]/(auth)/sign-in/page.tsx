import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { signInAction } from "../actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, GoogleButton } from "@/components/auth/field";

export default async function SignInPage() {
  const t = await getTranslations("auth.signIn");
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <AuthForm action={signInAction} submitLabel={t("submit")}>
        <Field label={t("email")} name="email" type="email" required autoComplete="email" />
        <Field
          label={t("password")}
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </AuthForm>
      <GoogleButton label={t("googleButton")} />
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password">{t("forgotPassword")}</Link>
        <Link href="/sign-up">{t("noAccount")}</Link>
      </div>
    </>
  );
}
