"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { TrackPayload } from "@/lib/view-stats";

/** Fire and forget: the visit must never wait for (or break because of) the counter. */
function send(payload: TrackPayload) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    // counting is optional
  }
}

/** The page reported last, kept outside React so a re-run of the effect does not count it again. */
let lastPage: string | null = null;

/**
 * Counts page views (one per page opened) and clicks on links to the shop (`<a data-track-shop>`; the value is
 * the product id when the link sits on a product page). Mounted once in the site layout.
 */
export function ViewTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  useEffect(() => {
    // Effects run twice in development (Strict Mode): the same page is only reported once in a row.
    if (lastPage === pathname) return;
    lastPage = pathname;
    send({ kind: "page", locale });
  }, [pathname, locale]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[data-track-shop]");
      if (link) send({ kind: "shop", locale, productId: link.getAttribute("data-track-shop") || undefined });
    };
    // auxclick: opening the shop in a new tab with the middle button counts too.
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, [locale]);

  return null;
}

/** Counts a product page once per browser session, so reloading or coming back does not inflate the ranking. */
export function ProductViewTracker({ productId, locale }: { productId: string; locale: Locale }) {
  useEffect(() => {
    const key = `webner_viewed_${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: count the view anyway
    }
    send({ kind: "product", locale, productId });
  }, [productId, locale]);

  return null;
}
