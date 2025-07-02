ALTER TABLE "committees" ADD COLUMN "secretary_id" integer;--> statement-breakpoint
ALTER TABLE "committees" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "council_members" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_secretary_id_council_members_id_fk" FOREIGN KEY ("secretary_id") REFERENCES "public"."council_members"("id") ON DELETE no action ON UPDATE no action;