CREATE TABLE "view_stats" (
	"day" date NOT NULL,
	"kind" text NOT NULL,
	"ref" text DEFAULT '' NOT NULL,
	"locale" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "view_stats_day_kind_ref_locale_pk" PRIMARY KEY("day","kind","ref","locale")
);
