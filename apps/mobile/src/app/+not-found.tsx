import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center bg-white p-6 dark:bg-neutral-950">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="mt-4 text-brand-500">
          Go home
        </Link>
      </View>
    </>
  );
}
