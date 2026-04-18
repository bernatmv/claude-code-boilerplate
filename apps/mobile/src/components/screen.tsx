import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-white p-4 dark:bg-neutral-950", className)}
      edges={["top", "bottom"]}
    >
      {children}
    </SafeAreaView>
  );
}
