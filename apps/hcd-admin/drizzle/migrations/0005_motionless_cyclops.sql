CREATE TABLE "modificatorias_tmp_backup" (
	"idmodif" integer,
	"idord" integer,
	"numaprob" integer,
	"nombre" text,
	"año" integer,
	"observaciones" text,
	"ordenanza" integer
);
--> statement-breakpoint
ALTER TABLE "committees" ADD COLUMN "secretary_hcd_id" integer;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "organization" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "position" varchar(100);--> statement-breakpoint
ALTER TABLE "ordinances" ADD COLUMN "derogada_por" integer;--> statement-breakpoint
ALTER TABLE "ordinances" ADD COLUMN "is_modifies" boolean;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_secretary_hcd_id_staff_id_fk" FOREIGN KEY ("secretary_hcd_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_groups" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "role";