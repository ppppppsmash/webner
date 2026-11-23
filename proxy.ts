import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/locales";

const { auth } = NextAuth(authConfig);

const PUBLIC_MANAGEMENT_PATHS = [/^\/management\/login$/, /^\/management\/invite\/[^/]+$/];
const LOCALE_COOKIE = "webner_locale";

/**
 * Language for a URL without a locale: the one the visitor chose before (cookie), otherwise German.
 * The browser language is not used on purpose, so a first visit always opens in German.
 */
function detectLocale(req: { cookies: { get(name: string): { value: string } | undefined } }): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  return fromCookie && (LOCALES as readonly string[]).includes(fromCookie) ? (fromCookie as Locale) : DEFAULT_LOCALE;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ---- Management: session required ---------------------------------------
  if (pathname.startsWith("/management") || pathname.startsWith("/api/upload")) {
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
  }

  // ---- Public site: every page lives under /{locale} ------------------------
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    const locale = pathname.split("/")[1];
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
});

export const config = {
  // Everything except Next internals, auth routes, uploads and static files.
  matcher: ["/((?!_next|api/auth|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)", "/api/upload/:path*"],
};
