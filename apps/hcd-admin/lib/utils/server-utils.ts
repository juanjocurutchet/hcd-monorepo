import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"

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