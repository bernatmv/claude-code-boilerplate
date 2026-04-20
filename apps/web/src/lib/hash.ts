const encoder = new TextEncoder();

export type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export async function hashHex(
  input: string | ArrayBuffer | Uint8Array,
  algorithm: HashAlgorithm = "SHA-256",
): Promise<string> {
  const bytes: Uint8Array =
    typeof input === "string"
      ? encoder.encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input);
  const digest = await crypto.subtle.digest(algorithm, bytes as unknown as BufferSource);
  return bytesToHex(new Uint8Array(digest));
}

export async function etag(
  input: string | ArrayBuffer | Uint8Array,
  algorithm: HashAlgorithm = "SHA-256",
): Promise<string> {
  const hex = await hashHex(input, algorithm);
  return `W/"${hex.slice(0, 16)}"`;
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}
