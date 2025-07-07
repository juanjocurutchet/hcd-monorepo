import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function applyMigration() {
  try {
    console.log('Aplicando migración para campos de notificación...');

    // Agregar campos de notificación a la tabla activities
    await sql`
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "enable_notifications" boolean DEFAULT true NOT NULL;
    `;

    await sql`
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "notification_advance" integer DEFAULT 24 NOT NULL;
    `;

    await sql`
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "notification_emails" text;
    `;

    await sql`
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "last_notification_sent" timestamp;
    `;

    console.log('✅ Migración aplicada exitosamente');
  } catch (error) {
    console.error('❌ Error aplicando migración:', error);
    process.exit(1);
  }
}

applyMigration();