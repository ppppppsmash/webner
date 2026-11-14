import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { LocalizedText } from "@/lib/i18n/locales";
import { PRODUCT_BADGES } from "@/lib/product-badges";
import { PRODUCT_VISIBILITIES } from "@/lib/product-visibility";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const localizedJson = (name: string) =>
  jsonb(name)
    .$type<LocalizedText>()
    .notNull()
    .default(sql`'{}'::jsonb`);

// ---------------------------------------------------------------------------
// Admins (management users). Invitation based: a row must exist before login.
// ---------------------------------------------------------------------------
export const adminRoleEnum = pgEnum("admin_role", ["owner", "admin"]);
export const adminStatusEnum = pgEnum("admin_status", ["invited", "active", "disabled"]);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    image: text("image"),
    passwordHash: text("password_hash"),
    role: adminRoleEnum("role").notNull().default("admin"),
    status: adminStatusEnum("status").notNull().default("invited"),
    inviteToken: text("invite_token").unique(),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
    invitedById: uuid("invited_by_id"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("admins_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// Categories: two levels (parent / child), names in 4 locales.
// ---------------------------------------------------------------------------
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    name: localizedJson("name"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("categories_parent_idx").on(t.parentId)],
);

// ---------------------------------------------------------------------------
// Products: gallery items. No price, no stock.
// ---------------------------------------------------------------------------
export const productBadgeEnum = pgEnum("product_badge", PRODUCT_BADGES);
export const productVisibilityEnum = pgEnum("product_visibility", PRODUCT_VISIBILITIES);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: localizedJson("name"),
    /** Rich text (HTML) per locale */
    description: localizedJson("description"),
    /** Short tagline per locale (optional) */
    summary: localizedJson("summary"),
    /** SEO <title> per locale (falls back to name) */
    seoTitle: localizedJson("seo_title"),
    /** SEO meta description per locale (falls back to summary) */
    seoDescription: localizedJson("seo_description"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    /** e.g. "100ml" */
    volume: text("volume"),
    /** Link to the product page on the existing shop (japanaceshop.com). */
    externalUrl: text("external_url"),
    visibility: productVisibilityEnum("visibility").notNull().default("draft"),
    /** Scheduled go-live: a published product only shows once this time has passed (null = immediately) */
    publishAt: timestamp("publish_at", { withTimezone: true }),
    isFeatured: boolean("is_featured").notNull().default(false),
    badge: productBadgeEnum("badge"),
    /** Internal tags for searching / grouping in the management panel (never shown on the public site) */
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_visibility_idx").on(t.visibility),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    isMain: boolean("is_main").notNull().default(false),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const videoKindEnum = pgEnum("video_kind", ["file", "embed"]);

export const productVideos = pgTable(
  "product_videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    kind: videoKindEnum("kind").notNull(),
    /** Uploaded file URL, or embed page URL (YouTube etc.) */
    url: text("url").notNull(),
    title: text("title"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("product_videos_product_idx").on(t.productId)],
);

/** Manually picked related products (max 4 in the UI). Falls back to same-category products when empty. */
export const productRelations = pgTable(
  "product_relations",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    relatedId: uuid("related_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.relatedId] }), index("product_relations_product_idx").on(t.productId)],
);

// ---------------------------------------------------------------------------
// Media library: every uploaded file. Products reference files by URL, so one
// file can be reused by several products; a file is deleted from the library,
// never together with a product.
// ---------------------------------------------------------------------------
export const mediaKindEnum = pgEnum("media_kind", ["image", "video"]);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: mediaKindEnum("kind").notNull(),
    /** Storage key (path inside the bucket / upload dir) */
    key: text("key").notNull().unique(),
    /** Public URL as stored in product_images.url / product_videos.url */
    url: text("url").notNull().unique(),
    /** Original file name as uploaded */
    fileName: text("file_name"),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull().default(0),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("media_kind_created_idx").on(t.kind, t.createdAt)],
);

// ---------------------------------------------------------------------------
// Site settings: simple key/value store (e.g. shop link on/off).
// ---------------------------------------------------------------------------
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamps.updatedAt,
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryTree",
  }),
  children: many(categories, { relationName: "categoryTree" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  videos: many(productVideos),
  related: many(productRelations, { relationName: "relationOwner" }),
}));

export const productRelationsRelations = relations(productRelations, ({ one }) => ({
  product: one(products, { fields: [productRelations.productId], references: [products.id], relationName: "relationOwner" }),
  relatedProduct: one(products, { fields: [productRelations.relatedId], references: [products.id], relationName: "relationTarget" }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVideosRelations = relations(productVideos, ({ one }) => ({
  product: one(products, { fields: [productVideos.productId], references: [products.id] }),
}));

export type Admin = typeof admins.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductVideo = typeof productVideos.$inferSelect;
export type ProductRelation = typeof productRelations.$inferSelect;
export type Media = typeof media.$inferSelect;
export type MediaKind = (typeof mediaKindEnum.enumValues)[number];
