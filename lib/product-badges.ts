/** Promotional label shown on the product card (one per product, like SHOPLINE's 促銷標籤). Safe to import from client code. */
export const PRODUCT_BADGES = ["new", "limited", "popular"] as const;
export type ProductBadge = (typeof PRODUCT_BADGES)[number];
