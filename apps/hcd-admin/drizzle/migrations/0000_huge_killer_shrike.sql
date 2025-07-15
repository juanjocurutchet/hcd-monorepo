DO $$ BEGIN
    CREATE TYPE "public"."document_type" AS ENUM('ordenanza', 'decreto', 'resolucion', 'comunicacion');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."session_type" AS ENUM('ordinaria', 'extraordinaria', 'especial', 'preparatoria');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(255),
	"date" timestamp NOT NULL,
	"image_url" varchar(255),
	"is_published" boolean DEFAULT true NOT NULL,
	"enable_notifications" boolean DEFAULT true NOT NULL,
	"notification_advance" integer DEFAULT 24 NOT NULL,
	"notification_emails" text,
	"last_notification_sent" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer NOT NULL,
	"council_member_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"committee_id" integer NOT NULL,
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
CREATE TABLE "committee_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"committee_id" integer NOT NULL,
	"council_member_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"president_id" integer,
	"secretary_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"organization" varchar(255),
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'contact' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "council_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"position" varchar(255),
	"senior_position" varchar(255),
	"block_id" integer,
	"mandate" varchar(100),
	"image_url" varchar(255),
	"bio" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"number" varchar(100),
	"type" "document_type" NOT NULL,
	"content" text,
	"file_url" varchar(255),
	"published_at" timestamp,
	"author_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"image_url" varchar(255),
	"published_at" timestamp DEFAULT now() NOT NULL,
	"author_id" integer,
	"slug" varchar(255) NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
CREATE TABLE "ordinance_modifica" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordinance_id" integer NOT NULL,
	"modificadora_numero" integer NOT NULL,
	"observaciones" text
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
--> statement-breakpoint
CREATE TABLE "political_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"president_id" integer,
	"color" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"type" varchar(50) NOT NULL,
	"agenda_file_url" varchar(255),
	"minutes_file_url" varchar(255),
	"audio_file_url" varchar(255),
	"video_url" varchar(255),
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"block_id" integer,
	"bio" text,
	"image_url" varchar(255),
	"email" varchar(255),
	"telefono" varchar(100),
	"facebook" varchar(255),
	"instagram" varchar(255),
	"twitter" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'editor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_council_member_id_council_members_id_fk" FOREIGN KEY ("council_member_id") REFERENCES "public"."council_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_files" ADD CONSTRAINT "commission_files_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_council_member_id_council_members_id_fk" FOREIGN KEY ("council_member_id") REFERENCES "public"."council_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_president_id_council_members_id_fk" FOREIGN KEY ("president_id") REFERENCES "public"."council_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_secretary_id_council_members_id_fk" FOREIGN KEY ("secretary_id") REFERENCES "public"."council_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "council_members" ADD CONSTRAINT "council_members_block_id_political_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."political_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_deroga" ADD CONSTRAINT "document_deroga_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_deroga" ADD CONSTRAINT "document_deroga_target_id_documents_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_modifica" ADD CONSTRAINT "document_modifica_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_modifica" ADD CONSTRAINT "document_modifica_target_id_documents_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordinance_modifica" ADD CONSTRAINT "ordinance_modifica_ordinance_id_ordinances_id_fk" FOREIGN KEY ("ordinance_id") REFERENCES "public"."ordinances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_block_id_political_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."political_blocks"("id") ON DELETE no action ON UPDATE no action;