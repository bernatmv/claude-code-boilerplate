import { getTranslations } from "next-intl/server";

import { forgotPasswordAction } from "../actions";
import { AuthForm } from "@/components/auth/auth-form";
import { Field } from "@/components/auth/field";

export default async function ForgotPasswordPage() {
  const common = await getTranslations("auth.signIn");
  const t = await getTranslations("auth.forgotPassword");
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <AuthForm action={forgotPasswordAction} submitLabel={t("submit")} successMessage={t("sent")}>
        <Field label={common("email")} name="email" type="email" required />
      </AuthForm>
    </>
  );
}
