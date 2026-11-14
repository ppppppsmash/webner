ALTER TABLE "products" ADD COLUMN "seo_title" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seo_description" jsonb DEFAULT '{}'::jsonb NOT NULL;