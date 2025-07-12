
import { db } from '../lib/db-singleton';

async function applyMigration() {
  try {
    console.log('Aplicando migración para crear tablas de contactos...');

    // Crear tabla de contactos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "phone" varchar(50),
        "organization" varchar(255),
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "contacts_email_unique" UNIQUE("email")
      );
    `);

    // Crear tabla de grupos de contactos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "contact_groups" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Crear tabla de relación muchos a muchos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "contact_group_members" (
        "id" serial PRIMARY KEY NOT NULL,
        "contact_id" integer NOT NULL,
        "group_id" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "contact_group_members_contact_id_group_id_unique" UNIQUE("contact_id", "group_id"),
        CONSTRAINT "contact_group_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE cascade,
        CONSTRAINT "contact_group_members_group_id_contact_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "contact_groups"("id") ON DELETE cascade
      );
    `);

    console.log('✅ Tablas de contactos creadas exitosamente');
  } catch (error) {
    console.error('❌ Error aplicando migración:', error);
    process.exit(1);
  }
}

applyMigration();
