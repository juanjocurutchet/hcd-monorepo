import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Verificar que la variable de entorno existe
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Crear una instancia singleton de la conexión
let globalForDb = globalThis as unknown as { dbInstance?: ReturnType<typeof drizzle>, sqlInstance?: ReturnType<typeof neon> };

// Variables para producción
let sqlInstance: ReturnType<typeof neon> | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

function getSql() {
  if (process.env.NODE_ENV === "development") {
    if (!globalForDb.sqlInstance) {
      console.log("[DEV] Creando nueva conexión a la base de datos...");
      globalForDb.sqlInstance = neon(process.env.DATABASE_URL!);
    }
    return globalForDb.sqlInstance;
  } else {
    if (!sqlInstance) {
      sqlInstance = neon(process.env.DATABASE_URL!);
    }
    return sqlInstance;
  }
}

function getDb() {
  if (process.env.NODE_ENV === "development") {
    if (!globalForDb.dbInstance) {
      globalForDb.dbInstance = drizzle(getSql());
    }
    return globalForDb.dbInstance;
  } else {
    if (!dbInstance) {
      dbInstance = drizzle(getSql());
    }
    return dbInstance;
  }
}

export const sql = getSql();
export const db = getDb();

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