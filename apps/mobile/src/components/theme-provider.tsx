import { useEffect, type ReactNode } from "react";
import { colorScheme } from "nativewind";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    colorScheme.set("system");
  }, []);
  return <>{children}</>;
}
