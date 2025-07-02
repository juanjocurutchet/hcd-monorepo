import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Configuración para conexión a la base de datos
const connectionString = process.env.DATABASE_URL || ""

// Para uso en producción
const client = postgres(connectionString)
export const db = drizzle(client, { schema })

// Función para migrar la base de datos (útil en desarrollo)
export async function migrate() {
  if (process.env.NODE_ENV !== "production") {
    const { migrate } = await import("drizzle-orm/postgres-js/migrator")
    await migrate(db, { migrationsFolder: "./drizzle" })
    console.log("Migración completada")
  }
}
