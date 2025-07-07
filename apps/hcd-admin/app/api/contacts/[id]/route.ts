import { db } from "@/lib/db-singleton"
import { contacts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, position, isActive } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      )
    }

    const updatedContact = await db
      .update(contacts)
      .set({
        name,
        email,
        position: position || null,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, parseInt(params.id)))
      .returning()

    if (updatedContact.length === 0) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedContact[0])
  } catch (error: any) {
    console.error("Error updating contact:", error)

    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: "Ya existe un contacto con ese email" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al actualizar contacto" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedContact = await db
      .delete(contacts)
      .where(eq(contacts.id, parseInt(params.id)))
      .returning()

    if (deletedContact.length === 0) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Contacto eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      { error: "Error al eliminar contacto" },
      { status: 500 }
    )
  }
}