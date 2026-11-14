CREATE TYPE "public"."product_badge" AS ENUM('new', 'limited', 'popular');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badge" "product_badge";