export const REQUEST_ID_HEADER = "x-request-id";

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function getOrGenerateRequestId(headers: Headers): string {
  return headers.get(REQUEST_ID_HEADER) ?? generateRequestId();
}
