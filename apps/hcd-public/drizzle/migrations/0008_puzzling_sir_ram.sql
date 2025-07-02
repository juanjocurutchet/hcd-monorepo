CREATE TABLE "ordinance_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ordinance_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ordinance_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ordinance_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ordinances" (
	"id" serial PRIMARY KEY NOT NULL,
	"approval_number" integer NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"file_url" text,
	"slug" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ordinances_slug_unique" UNIQUE("slug")
);
