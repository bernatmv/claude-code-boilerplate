import { createHmac, timingSafeEqual } from "node:crypto";

export type HmacAlgorithm = "sha256" | "sha1" | "sha512";

export function computeHmac(
  secret: string,
  payload: string | Buffer,
  algorithm: HmacAlgorithm = "sha256",
): string {
  return createHmac(algorithm, secret).update(payload).digest("hex");
}

export function verifyHmac(
  secret: string,
  payload: string | Buffer,
  signature: string,
  algorithm: HmacAlgorithm = "sha256",
): boolean {
  const expected = computeHmac(secret, payload, algorithm);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature.replace(/^sha256=|^sha1=|^sha512=/, ""), "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
