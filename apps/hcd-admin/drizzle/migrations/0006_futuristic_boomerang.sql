CREATE TABLE "session_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"expediente_number" varchar(100) NOT NULL,
	"fecha_entrada" timestamp NOT NULL,
	"descripcion" text NOT NULL,
	"despacho" boolean DEFAULT false NOT NULL,
	"fecha_despacho" timestamp,
	"file_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_files" ADD CONSTRAINT "session_files_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;