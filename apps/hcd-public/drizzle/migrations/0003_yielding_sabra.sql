CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"block_id" integer,
	"bio" text,
	"image_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_block_id_political_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."political_blocks"("id") ON DELETE no action ON UPDATE no action;