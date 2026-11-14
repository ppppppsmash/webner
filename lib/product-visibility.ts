/**
 * Product visibility (like SHOPLINE's 上架 + 隱藏商品):
 * - draft: not reachable on the public site
 * - hidden: not listed, but reachable by direct URL (noindex)
 * - published: listed everywhere
 * Safe to import from client code.
 */
export const PRODUCT_VISIBILITIES = ["draft", "hidden", "published"] as const;
export type ProductVisibility = (typeof PRODUCT_VISIBILITIES)[number];
