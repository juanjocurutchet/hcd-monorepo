import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Obtener el usuario administrador
    const users = await sql`
      SELECT id, name, email, password, role 
      FROM users 
      WHERE email = 'admin@hcdlasflores.gob.ar'
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario administrador no encontrado" }, { status: 404 })
    }

    const user = users[0]

    // Verificar si la contraseña 'admin123' coincide con el hash almacenado
    const testPassword = "admin123"
    const isPasswordValid = await bcrypt.compare(testPassword, user.password)

    // Generar un nuevo hash para 'admin123' para comparación
    const newHash = await bcrypt.hash(testPassword, 10)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      passwordCheck: {
        storedHash: user.password,
        newGeneratedHash: newHash,
        isValid: isPasswordValid,
        testPassword: testPassword,
      },
    })
  } catch (error) {
    console.error("Error al verificar contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
