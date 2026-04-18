import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import {
  AuthField,
  FormCard,
  FormStatus,
  SubmitButton,
  useAuthState,
} from "@/components/auth-form";
import { Screen } from "@/components/screen";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const state = useAuthState();

  async function submit() {
    state.reset();
    state.setPending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) state.setError(error.message);
      else state.setSuccess(t("forgotPassword.sent"));
    } finally {
      state.setPending(false);
    }
  }

  return (
    <Screen>
      <FormCard>
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("forgotPassword.title")}
        </Text>
        <AuthField
          label={t("signIn.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <SubmitButton label={t("forgotPassword.submit")} onPress={submit} pending={state.pending} />
        <FormStatus error={state.error} success={state.success} />
      </FormCard>
    </Screen>
  );
}
