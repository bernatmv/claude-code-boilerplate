import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./navigation";
import { updateSession } from "./lib/supabase/middleware";

const intl = createIntlMiddleware(routing);
const MAINTENANCE_PATH = "/maintenance";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" &&
    pathname !== MAINTENANCE_PATH &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.rewrite(new URL(MAINTENANCE_PATH, request.url));
  }

  const intlResponse = intl(request);
  const authResponse = await updateSession(request);
  for (const cookie of authResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie.name, cookie.value);
  }
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
