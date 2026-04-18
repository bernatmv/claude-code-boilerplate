// Drift detection: fail if committed database types differ from the linked schema.
// Run via: pnpm db:types:check  (requires `supabase link` to have been run)
import { execSync } from "child_process";
import { readFileSync } from "fs";

const TYPES_FILE = "packages/database-types/src/index.ts";

let generated;
try {
  generated = execSync("supabase gen types typescript --linked --schema public", {
    encoding: "utf-8",
    stdio: ["inherit", "pipe", "inherit"],
  });
} catch {
  console.error("ERROR: Failed to generate types. Is `supabase link` configured?");
  process.exit(1);
}

const committed = readFileSync(TYPES_FILE, "utf-8");

if (generated !== committed) {
  console.error("ERROR: Database types are out of sync with the linked schema.");
  console.error("Run `pnpm db:types` to regenerate, then commit the result.");
  process.exit(1);
}

console.log("OK: Database types match the linked schema.");
