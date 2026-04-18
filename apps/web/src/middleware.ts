import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./navigation";
import { updateSession } from "./lib/supabase/middleware";

const intl = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const intlResponse = intl(request);
  for (const cookie of response.cookies.getAll()) {
    intlResponse.cookies.set(cookie.name, cookie.value);
  }
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === "set-cookie") continue;
    intlResponse.headers.set(key, value);
  }
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
