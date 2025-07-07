import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DB URL (DELETE):", process.env.DATABASE_URL); // Log de depuración
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, parseInt(params.id)))
      .returning()
    console.log("USUARIO ELIMINADO:", deletedUser); // Log de depuración

    if (deletedUser.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, role, password } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Nombre, email y rol son requeridos" },
        { status: 400 }
      )
    }

    const updateData: any = { name, email, role }
    if (password) {
      // Aquí deberías hashear la contraseña antes de guardarla
      updateData.password = password
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(params.id)))
      .returning()

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}