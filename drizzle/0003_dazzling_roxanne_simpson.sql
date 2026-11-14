CREATE TYPE "public"."product_visibility" AS ENUM('draft', 'hidden', 'published');--> statement-breakpoint
DROP INDEX "products_published_idx";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "visibility" "product_visibility" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
CREATE INDEX "products_visibility_idx" ON "products" USING btree ("visibility");--> statement-breakpoint
UPDATE "products" SET "visibility" = 'published' WHERE "is_published" = true;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_published";