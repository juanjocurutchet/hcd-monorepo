import { users } from "@/lib/db/schema"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { db } from "./db-singleton"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export type RegisterUserInput = {
  name: string
  email: string
  password: string
  role?: string
}

export async function registerUser(input: RegisterUserInput) {
  const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  if (existingUser.length > 0) {
    throw new Error("El email ya está en uso")
  }
  const hashedPassword = await bcrypt.hash(input.password, 10)
  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || "editor",
    })
    .returning()
  const newUser = result[0]
  if (!newUser) throw new Error("No se pudo crear el usuario")
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  }
}

export async function loginUser(email: string, password: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (user.length === 0) {
    throw new Error("Credenciales inválidas")
  }
  if (!user[0]?.password) {
    throw new Error("Usuario sin contraseña definida")
  }
  const isPasswordValid = await bcrypt.compare(password, user[0].password)
  if (!isPasswordValid) {
    throw new Error("Credenciales inválidas")
  }
  const token = jwt.sign(
    {
      id: user[0]?.id,
      email: user[0]?.email,
      role: user[0]?.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  )
  return {
    user: {
      id: user[0]?.id,
      name: user[0]?.name,
      email: user[0]?.email,
      role: user[0]?.role,
    },
    token,
  }
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
      role: string
    }
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1)
    if (user.length === 0) {
      throw new Error("Usuario no encontrado")
    }
    return {
      id: user[0]?.id,
      name: user[0]?.name,
      email: user[0]?.email,
      role: user[0]?.role,
    }
  } catch (error) {
    throw new Error("Token inválido")
  }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length === 0) {
    throw new Error("Usuario no encontrado")
  }
  if (!user[0]?.password) {
    throw new Error("Usuario sin contraseña definida")
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password)
  if (!isPasswordValid) {
    throw new Error("Contraseña actual incorrecta")
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
  return { success: true }
}