#!/usr/bin/env node

const { config } = require('dotenv');
const { resolve } = require('path');

// Cargar variables de entorno ANTES de cualquier require de base de datos
config({ path: resolve(__dirname, '../.env') });

const { db } = require('../lib/db-singleton');

async function main() {
  console.log("🔄 Creando tablas de contactos...");
  console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`);

  try {
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

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "contact_groups" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

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

    console.log("✅ Tablas de contactos creadas exitosamente");
  } catch (error) {
    console.error("❌ Error creando las tablas:", error);
    process.exit(1);
  }

  console.log("🏁 Script finalizado");
}

main();