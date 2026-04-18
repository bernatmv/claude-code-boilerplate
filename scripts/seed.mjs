// Seed script for development.
// Run: pnpm db:seed  (requires .env.local with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
// Idempotent: safe to run multiple times.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  console.error("  Make sure .env.local exists (copy from .env.example).");
  process.exit(1);
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
};

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`listUsers: ${await res.text()}`);
  const data = await res.json();
  return data.users ?? [];
}

async function ensureUser(email, password, fullName) {
  const users = await listUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    console.log(`  ${email} already exists (${existing.id})`);
    return existing.id;
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: true,
    }),
  });
  if (!res.ok) throw new Error(`createUser(${email}): ${await res.text()}`);
  const user = await res.json();
  console.log(`  Created ${email} (${user.id})`);
  return user.id;
}

async function getUserItemCount(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/items?user_id=eq.${userId}&select=id`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`getUserItemCount: ${await res.text()}`);
  const rows = await res.json();
  return rows.length;
}

async function insertItem(userId, title, description) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
    method: "POST",
    headers: { ...authHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: userId, title, description }),
  });
  if (!res.ok) throw new Error(`insertItem("${title}"): ${await res.text()}`);
  console.log(`  Created item "${title}"`);
}

console.log("Seeding users...");
const aliceId = await ensureUser("alice@example.com", "password123", "Alice Example");
const bobId = await ensureUser("bob@example.com", "password123", "Bob Example");

console.log("Seeding items...");
const aliceCount = await getUserItemCount(aliceId);
if (aliceCount > 0) {
  console.log(`  Alice already has ${aliceCount} item(s) — skipping`);
} else {
  await insertItem(aliceId, "Welcome item", "Alice's first demo item — edit or delete it.");
  await insertItem(aliceId, "Second item", "Another demo item to demonstrate the list view.");
}

const bobCount = await getUserItemCount(bobId);
if (bobCount > 0) {
  console.log(`  Bob already has ${bobCount} item(s) — skipping`);
} else {
  await insertItem(bobId, "Bob's item", "Belongs to Bob — Alice cannot see this via the API.");
}

console.log("Seed complete!");
