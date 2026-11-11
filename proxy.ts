import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_MANAGEMENT_PATHS = [/^\/management\/login$/, /^\/management\/invite\/[^/]+$/];

/**
 * Splits the app: everything under /management requires a session,
 * except the login and invitation pages.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_MANAGEMENT_PATHS.some((re) => re.test(pathname));
  const isLoggedIn = Boolean(req.auth?.user);

  if (!isLoggedIn && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/management/login", req.nextUrl);
    if (pathname !== "/management") url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && pathname === "/management/login") {
    return NextResponse.redirect(new URL("/management", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/management/:path*", "/api/upload/:path*"],
};
