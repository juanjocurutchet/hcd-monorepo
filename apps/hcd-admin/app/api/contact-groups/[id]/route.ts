import { db } from "@/lib/db-singleton"
import { contactGroups } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: "Nombre del grupo es requerido" },
        { status: 400 }
      )
    }

    const updatedGroup = await db
      .update(contactGroups)
      .set({
        name,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(contactGroups.id, parseInt(params.id)))
      .returning()

    if (updatedGroup.length === 0) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedGroup[0])
  } catch (error: any) {
    console.error("Error updating contact group:", error)

    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: "Ya existe un grupo con ese nombre" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al actualizar grupo de contactos" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedGroup = await db
      .delete(contactGroups)
      .where(eq(contactGroups.id, parseInt(params.id)))
      .returning()

    if (deletedGroup.length === 0) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Grupo eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting contact group:", error)
    return NextResponse.json(
      { error: "Error al eliminar grupo de contactos" },
      { status: 500 }
    )
  }
}