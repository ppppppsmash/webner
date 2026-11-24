import type { Metadata } from "next";

/**
 * Browser tab / home-screen icons for both root layouts (public site and management panel).
 * An image uploaded in the management panel (設定 → 網站圖示) is used as it is; without one the
 * built-in leaf icons in public/ are served.
 */
export function siteIcons(faviconUrl: string): NonNullable<Metadata["icons"]> {
  if (faviconUrl) return { icon: faviconUrl, apple: faviconUrl };
  return {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  };
}
