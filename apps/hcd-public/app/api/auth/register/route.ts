import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
    }

    const result = await registerUser({ name, email, password, role })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar usuario" }, { status: 400 })
  }
}
