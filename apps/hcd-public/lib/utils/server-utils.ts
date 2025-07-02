// lib/utils/server-utils.ts
import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      console.error("No hay sesión de NextAuth")
      return false
    }

    return token.role === "admin"
  } catch (error) {
    console.error("Error al verificar el token de NextAuth:", error)
    return false
  }
}

// ✅ Nueva función para obtener el usuario autenticado completo
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      throw new Error("No hay sesión activa")
    }

    if (token.role !== "admin") {
      throw new Error("No autorizado")
    }

    return {
      id: Number(token.sub), // sub contiene el ID del usuario
      email: token.email as string,
      name: token.name as string,
      role: token.role as string
    }
  } catch (error) {
    console.error("Error al obtener usuario autenticado:", error)
    throw error
  }
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<number> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      throw new Error("No hay sesión activa")
    }

    if (token.role !== "admin") {
      throw new Error("No autorizado")
    }

    const userId = Number(token.sub)
    if (isNaN(userId)) {
      throw new Error("ID de usuario inválido")
    }

    return userId
  } catch (error) {
    console.error("Error al obtener ID de usuario:", error)
    throw error
  }
}