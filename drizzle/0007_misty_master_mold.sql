CREATE TYPE "public"."media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "media_kind" NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"file_name" text,
	"content_type" text NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key"),
	CONSTRAINT "media_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE INDEX "media_kind_created_idx" ON "media" USING btree ("kind","created_at");--> statement-breakpoint
-- Backfill: register files already referenced by products (local driver URLs only).
INSERT INTO "media" ("kind", "key", "url", "file_name", "content_type", "size")
SELECT 'image', substring(url from 10), url, regexp_replace(url, '^.*/', ''),
  CASE lower(regexp_replace(url, '^.*\.', ''))
    WHEN 'jpg' THEN 'image/jpeg' WHEN 'jpeg' THEN 'image/jpeg' WHEN 'png' THEN 'image/png'
    WHEN 'webp' THEN 'image/webp' WHEN 'gif' THEN 'image/gif' WHEN 'avif' THEN 'image/avif'
    ELSE 'application/octet-stream' END, 0
FROM (SELECT DISTINCT url FROM "product_images" WHERE url LIKE '/uploads/%') AS u
ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "media" ("kind", "key", "url", "file_name", "content_type", "size")
SELECT 'video', substring(url from 10), url, regexp_replace(url, '^.*/', ''),
  CASE lower(regexp_replace(url, '^.*\.', ''))
    WHEN 'mp4' THEN 'video/mp4' WHEN 'webm' THEN 'video/webm' WHEN 'mov' THEN 'video/quicktime'
    ELSE 'application/octet-stream' END, 0
FROM (SELECT DISTINCT url FROM "product_videos" WHERE kind = 'file' AND url LIKE '/uploads/%') AS u
ON CONFLICT DO NOTHING;
