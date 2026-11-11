import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/locales";

const { auth } = NextAuth(authConfig);

const PUBLIC_MANAGEMENT_PATHS = [/^\/management\/login$/, /^\/management\/invite\/[^/]+$/];
const LOCALE_COOKIE = "webner_locale";

/** Picks the best locale from the cookie, then Accept-Language, then the default. */
function detectLocale(req: Request & { cookies: { get(name: string): { value: string } | undefined } }): Locale {
  const fromCookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) return fromCookie as Locale;

  const header = req.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (tag.startsWith("zh")) {
      // zh-TW / zh-HK / zh-Hant → Traditional; zh-CN / zh-SG / zh-Hans / plain zh → Simplified
      return /tw|hk|mo|hant/.test(tag) ? "zh-TW" : "zh-CN";
    }
    if (tag.startsWith("de")) return "de";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
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
