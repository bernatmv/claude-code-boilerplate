import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import {
  AuthField,
  FormCard,
  FormStatus,
  GoogleDisabled,
  SubmitButton,
  useAuthState,
} from "@/components/auth-form";
import { Screen } from "@/components/screen";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const state = useAuthState();

  async function submit() {
    state.reset();
    state.setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) state.setError(error.message);
      else router.replace("/");
    } finally {
      state.setPending(false);
    }
  }

  return (
    <Screen>
      <FormCard>
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("signIn.title")}
        </Text>
        <AuthField
          label={t("signIn.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <AuthField
          label={t("signIn.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />
        <SubmitButton label={t("signIn.submit")} onPress={submit} pending={state.pending} />
        <GoogleDisabled label={t("signIn.googleButton")} />
        <FormStatus error={state.error} />
      </FormCard>
    </Screen>
  );
}
