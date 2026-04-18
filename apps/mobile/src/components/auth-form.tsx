import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

export function AuthField({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-neutral-700 dark:text-neutral-300">{label}</Text>
      <TextInput
        {...props}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

export function SubmitButton({
  label,
  onPress,
  pending,
}: {
  label: string;
  onPress: () => void | Promise<void>;
  pending?: boolean;
}) {
  return (
    <Pressable
      onPress={() => void onPress()}
      disabled={pending}
      className="rounded-md bg-brand-500 px-4 py-3 items-center disabled:opacity-60"
      accessibilityRole="button"
    >
      <Text className="text-white font-medium">{pending ? "…" : label}</Text>
    </Pressable>
  );
}

export function FormStatus({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) {
    return (
      <Text accessibilityRole="alert" className="text-sm text-red-600">
        {error}
      </Text>
    );
  }
  if (success) {
    return <Text className="text-sm text-green-600">{success}</Text>;
  }
  return null;
}

export function GoogleDisabled({ label }: { label: string }) {
  return (
    <Pressable
      disabled
      className="rounded-md border border-neutral-300 px-4 py-3 items-center opacity-60 dark:border-neutral-700"
      accessibilityRole="button"
    >
      <Text className="text-neutral-500">{label}</Text>
    </Pressable>
  );
}

export function useAuthState() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  return {
    pending,
    error,
    success,
    setPending,
    setError,
    setSuccess,
    reset: () => {
      setError(null);
      setSuccess(null);
    },
  };
}

export function FormCard({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}
