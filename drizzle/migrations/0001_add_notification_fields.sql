-- Agregar campos de notificación a la tabla activities existente
ALTER TABLE "activities" ADD COLUMN "enable_notifications" boolean DEFAULT true NOT NULL;
ALTER TABLE "activities" ADD COLUMN "notification_advance" integer DEFAULT 24 NOT NULL;
ALTER TABLE "activities" ADD COLUMN "notification_emails" text;
ALTER TABLE "activities" ADD COLUMN "last_notification_sent" timestamp;