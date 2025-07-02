import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Verificar que la variable de entorno existe
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Crear una instancia singleton de la conexión
let sqlInstance: ReturnType<typeof neon> | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

export function getSql() {
  if (!sqlInstance) {
    console.log("Creando nueva conexión a la base de datos...")
    sqlInstance = neon(process.env.DATABASE_URL!)
  }
  return sqlInstance
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getSql())
  }
  return dbInstance
}

// Exportar para compatibilidad
export const sql = getSql()
export const db = getDb()

// Función de prueba de conexión
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("Conexión a la base de datos exitosa:", result)
    return true
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error)
    return false
  }
}
