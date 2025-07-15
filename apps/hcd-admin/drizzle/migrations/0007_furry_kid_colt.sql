ALTER TABLE "session_files" ALTER COLUMN "descripcion" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_files" ADD COLUMN "numero_expediente" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_files" ADD COLUMN "titulo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session_files" ADD COLUMN "origen" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_files" ADD COLUMN "prefijo_origen" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "session_files" DROP COLUMN "expediente_number";--> statement-breakpoint
ALTER TABLE "session_files" DROP COLUMN "despacho";--> statement-breakpoint
ALTER TABLE "session_files" DROP COLUMN "fecha_despacho";