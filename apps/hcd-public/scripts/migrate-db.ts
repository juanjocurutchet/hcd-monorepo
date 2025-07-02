import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"
import dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config({ path: ".env.local" })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido en las variables de entorno")
  }

  console.log("Conectando a la base de datos...")
  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql)

  console.log("Ejecutando migraciones...")

  // Especifica la carpeta donde se encuentran tus archivos de migración
  await migrate(db, { migrationsFolder: "./drizzle" })

  console.log("Migraciones completadas exitosamente")
}

runMigration().catch((error) => {
  console.error("Error durante la migración:", error)
  process.exit(1)
})
