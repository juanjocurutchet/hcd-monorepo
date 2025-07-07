#!/usr/bin/env tsx

/**
 * Script para crear las tablas de contactos en la base de datos
 * Ejecutar: npx tsx scripts/create-contact-tables.ts
 */

import { config } from 'dotenv'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

import { db } from "../lib/db-singleton"

async function main() {
  console.log("🔄 Creando tablas de contactos...")
  console.log(`📅 Fecha y hora: ${new Date().toLocaleString('es-ES')}`)

  try {
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
    `)

    // Crear tabla de grupos de contactos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "contact_groups" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `)

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
    `)

    console.log("✅ Tablas de contactos creadas exitosamente")

    // Verificar que las tablas existen
    const tables = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('contacts', 'contact_groups', 'contact_group_members')
      ORDER BY table_name
    `)

    console.log("📋 Tablas verificadas:")
    tables.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`)
    })

  } catch (error) {
    console.error("❌ Error creando las tablas:", error)
    process.exit(1)
  }

  console.log("🏁 Script finalizado")
}

// Ejecutar el script
main()