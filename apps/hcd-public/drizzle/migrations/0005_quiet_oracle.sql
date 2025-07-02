CREATE TABLE "commission_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"committee_id" integer NOT NULL,
	"expediente_number" varchar(100) NOT NULL,
	"fecha_entrada" timestamp NOT NULL,
	"descripcion" text NOT NULL,
	"despacho" boolean DEFAULT false NOT NULL,
	"fecha_despacho" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commission_files" ADD CONSTRAINT "commission_files_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE no action ON UPDATE no action;