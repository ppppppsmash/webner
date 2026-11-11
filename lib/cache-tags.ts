/** Cache tags shared by the public site (readers) and the management actions (writers). */
export const CACHE_TAGS = {
  products: "products",
  product: (id: string) => `product-${id}`,
  categories: "categories",
  settings: "settings",
} as const;
