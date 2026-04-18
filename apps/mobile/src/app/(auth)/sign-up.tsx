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

export default function SignUp() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const state = useAuthState();

  async function submit() {
    state.reset();
    if (password !== confirm) {
      state.setError("Passwords must match");
      return;
    }
    state.setPending(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) state.setError(error.message);
      else state.setSuccess("Check your email to confirm.");
    } finally {
      state.setPending(false);
    }
  }

  return (
    <Screen>
      <FormCard>
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("signUp.title")}
        </Text>
        <AuthField
          label={t("signIn.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthField
          label={t("signIn.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AuthField
          label={t("signUp.confirmPassword")}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
        <SubmitButton label={t("signUp.submit")} onPress={submit} pending={state.pending} />
        <FormStatus error={state.error} success={state.success} />
      </FormCard>
    </Screen>
  );
}
