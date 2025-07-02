
import { users } from "@/lib/db/schema"

import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { db } from "./db-singleton"

// Obtener la clave secreta JWT del entorno
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Tipo para los datos de registro de usuario
export type RegisterUserInput = {
  name: string
  email: string
  password: string
  role?: string
}

/**
 * Registra un nuevo usuario en la base de datos
 */
export async function registerUser(input: RegisterUserInput) {
  // Verificar si el email ya está en uso
  const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

  if (existingUser.length > 0) {
    throw new Error("El email ya está en uso")
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(input.password, 10)

  // Insertar el nuevo usuario
  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || "editor",
    })
    .returning()

  // Retornar el usuario creado (sin la contraseña)
  const newUser = result[0]
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  }
}

/**
 * Autentica a un usuario con email y contraseña
 */
export async function loginUser(email: string, password: string) {
  console.log("Intentando login con email:", email)

  // Buscar el usuario
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (user.length === 0) {
    console.log("Usuario no encontrado")
    throw new Error("Credenciales inválidas")
  }

  console.log("Usuario encontrado:", user[0].id, user[0].email, user[0].role)

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user[0].password)
  console.log("¿Contraseña válida?:", isPasswordValid)

  if (!isPasswordValid) {
    console.log("Contraseña incorrecta")
    throw new Error("Credenciales inválidas")
  }

  // Generar token JWT
  const token = jwt.sign(
    {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  )

  return {
    user: {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    },
    token,
  }
}

/**
 * Verifica un token JWT y retorna los datos del usuario
 */
export async function verifyToken(token: string) {
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
      role: string
    }

    // Buscar el usuario en la base de datos
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1)

    if (user.length === 0) {
      throw new Error("Usuario no encontrado")
    }

    // Retornar los datos del usuario (sin la contraseña)
    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    }
  } catch (error) {
    throw new Error("Token inválido")
  }
}

/**
 * Cambia la contraseña de un usuario
 */
export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  // Buscar el usuario
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (user.length === 0) {
    throw new Error("Usuario no encontrado")
  }

  // Verificar la contraseña actual
  const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password)

  if (!isPasswordValid) {
    throw new Error("Contraseña actual incorrecta")
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Actualizar la contraseña
  await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return { success: true }
}
