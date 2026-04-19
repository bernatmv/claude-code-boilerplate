#!/usr/bin/env node
// Preflight check for boilerplate consumers. Verifies runtime + env configuration
// and reports which optional integrations are active.

import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

const envPath = join(root, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const results = [];
const add = (name, status, detail) => results.push({ name, status, detail });

// Runtime
const nodeMajor = Number(process.versions.node.split(".")[0]);
add("Node", nodeMajor === 22 ? "ok" : "warn", `v${process.versions.node} (need v22.x)`);

try {
  const pkg = require(join(root, "package.json"));
  add("Package manager", "ok", pkg.packageManager ?? "unknown");
} catch {
  add("Package manager", "fail", "package.json unreadable");
}

// Required env
const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
for (const key of required) {
  add(key, process.env[key] ? "ok" : "fail", process.env[key] ? "set" : "missing");
}

// Optional integrations (grouped)
const integrations = {
  "Service role": ["SUPABASE_SERVICE_ROLE_KEY"],
  Stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  Email: ["RESEND_API_KEY", "EMAIL_FROM"],
  "Rate limit": ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  Cron: ["CRON_SECRET"],
  Analytics: ["NEXT_PUBLIC_POSTHOG_KEY"],
  Flags: ["NEXT_PUBLIC_FEATURE_FLAGS"],
};
for (const [label, keys] of Object.entries(integrations)) {
  const missing = keys.filter((k) => !process.env[k]);
  add(
    label,
    missing.length === 0 ? "ok" : missing.length === keys.length ? "skip" : "warn",
    missing.length === 0 ? "configured" : `missing: ${missing.join(", ")}`,
  );
}

const symbol = { ok: "✓", warn: "!", fail: "✗", skip: "·" };
let hasFailure = false;
for (const r of results) {
  if (r.status === "fail") hasFailure = true;
  // eslint-disable-next-line no-console
  console.log(`${symbol[r.status]} ${r.name.padEnd(32)} ${r.detail}`);
}

if (hasFailure) {
   
  console.error("\nDoctor found blocking issues.");
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log("\nDoctor: all required checks passed.");
