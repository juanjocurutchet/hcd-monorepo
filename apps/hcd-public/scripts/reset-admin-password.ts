import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Cargar variables de entorno
dotenv.config({ path: ".env.local" })

async function resetAdminPassword() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido en las variables de entorno")
  }

  const sql = neon(process.env.DATABASE_URL)

  // Nueva contraseña para el administrador
  const newPassword = "admin123"
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  console.log("Restableciendo contraseña del administrador...")

  try {
    // Actualizar la contraseña del administrador
    await sql`
      UPDATE users 
      SET password = ${hashedPassword} 
      WHERE email = 'admin@hcdlasflores.gob.ar'
    `

    console.log("Contraseña restablecida exitosamente.")
    console.log("Email: admin@hcdlasflores.gob.ar")
    console.log("Contraseña: admin123")
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
  }
}

resetAdminPassword().catch(console.error)
