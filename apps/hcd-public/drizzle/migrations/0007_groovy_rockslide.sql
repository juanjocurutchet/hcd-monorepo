CREATE TABLE "document_deroga" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"target_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_modifica" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"target_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_deroga" ADD CONSTRAINT "document_deroga_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_deroga" ADD CONSTRAINT "document_deroga_target_id_documents_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_modifica" ADD CONSTRAINT "document_modifica_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_modifica" ADD CONSTRAINT "document_modifica_target_id_documents_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;