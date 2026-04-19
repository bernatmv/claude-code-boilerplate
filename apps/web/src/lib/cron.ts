export function isAuthorizedCronRequest(headers: Headers): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
