import { describe, expect, it } from "vitest";
import { LOCALES, messages, type Namespace } from "./index.js";

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out.push(...collectKeys(v, path));
    } else {
      out.push(path);
    }
  }
  return out.sort();
}

const NAMESPACES: Namespace[] = ["common", "auth", "errors"];

describe("locale parity", () => {
  for (const ns of NAMESPACES) {
    it(`every locale exposes the same keys for "${ns}"`, () => {
      const reference = collectKeys(messages.en[ns]);
      for (const locale of LOCALES) {
        const actual = collectKeys(messages[locale][ns]);
        expect(actual, `locale=${locale} namespace=${ns}`).toEqual(reference);
      }
    });
  }
});
