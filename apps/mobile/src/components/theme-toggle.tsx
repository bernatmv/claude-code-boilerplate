import { colorScheme, useColorScheme } from "nativewind";
import { Pressable, Text } from "react-native";

type Mode = "system" | "light" | "dark";

function cycle(mode: Mode): Mode {
  if (mode === "system") return "light";
  if (mode === "light") return "dark";
  return "system";
}

export function ThemeToggle() {
  const { colorScheme: current } = useColorScheme();
  const label = current ?? "system";
  return (
    <Pressable
      className="self-start rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700"
      onPress={() => colorScheme.set(cycle(label as Mode))}
      accessibilityRole="button"
    >
      <Text className="text-neutral-900 dark:text-neutral-50">Theme: {label}</Text>
    </Pressable>
  );
}
