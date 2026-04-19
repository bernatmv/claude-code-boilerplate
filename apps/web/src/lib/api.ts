import { NextResponse } from "next/server";

type ApiOk<T> = { ok: true; data: T };
type ApiError = { ok: false; error: string; code?: string };
export type ApiResponse<T> = ApiOk<T> | ApiError;

export function ok<T>(data: T, status = 200): NextResponse<ApiOk<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function err(message: string, status = 400, code?: string): NextResponse<ApiError> {
  return NextResponse.json({ ok: false, error: message, ...(code ? { code } : {}) }, { status });
}

export const apiErrors = {
  unauthorized: () => err("Unauthorized", 401, "UNAUTHORIZED"),
  forbidden: () => err("Forbidden", 403, "FORBIDDEN"),
  notFound: (resource = "Resource") => err(`${resource} not found`, 404, "NOT_FOUND"),
  badRequest: (msg: string) => err(msg, 400, "BAD_REQUEST"),
  internal: () => err("Internal server error", 500, "INTERNAL_ERROR"),
} as const;
