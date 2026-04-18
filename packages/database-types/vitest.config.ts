import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    include: ["src/**/*.test.ts"],
    // @ts-expect-error envDir is a valid Vitest option not yet reflected in the bundled types
    envDir: "../../",
  },
});
