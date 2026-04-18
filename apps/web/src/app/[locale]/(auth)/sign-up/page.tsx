import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { signUpAction } from "../actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Field, GoogleButton } from "@/components/auth/field";

export default async function SignUpPage() {
  const common = await getTranslations("auth.signIn");
  const t = await getTranslations("auth.signUp");
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <AuthForm
        action={signUpAction}
        submitLabel={t("submit")}
        successMessage="Check your email to confirm your account."
      >
        <Field label={common("email")} name="email" type="email" required />
        <Field
          label={common("password")}
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <Field
          label={t("confirmPassword")}
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
      </AuthForm>
      <GoogleButton label={common("googleButton")} />
      <Link href="/sign-in" className="text-sm">
        {t("haveAccount")}
      </Link>
    </>
  );
}
