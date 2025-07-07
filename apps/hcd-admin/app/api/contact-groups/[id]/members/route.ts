import { db } from "@/lib/db-singleton"
import { contactGroupMembers, contacts } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id)

    // Obtener todos los miembros del grupo con información del contacto
    const members = await db
      .select({
        id: contactGroupMembers.id,
        contactId: contactGroupMembers.contactId,
        groupId: contactGroupMembers.groupId,
        createdAt: contactGroupMembers.createdAt,
        contact: {
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
          position: contacts.position,
          isActive: contacts.isActive,
        }
      })
      .from(contactGroupMembers)
      .innerJoin(contacts, eq(contactGroupMembers.contactId, contacts.id))
      .where(
        and(
          eq(contactGroupMembers.groupId, groupId),
          eq(contacts.isActive, true)
        )
      )
      .orderBy(contacts.name)

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching group members:", error)
    return NextResponse.json(
      { error: "Error al obtener miembros del grupo" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { contactId } = body
    const groupId = parseInt(params.id)

    if (!contactId) {
      return NextResponse.json(
        { error: "ID del contacto es requerido" },
        { status: 400 }
      )
    }

    // Verificar si ya existe la relación
    const existingMember = await db
      .select()
      .from(contactGroupMembers)
      .where(
        and(
          eq(contactGroupMembers.contactId, contactId),
          eq(contactGroupMembers.groupId, groupId)
        )
      )

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: "El contacto ya pertenece a este grupo" },
        { status: 400 }
      )
    }

    const newMember = await db
      .insert(contactGroupMembers)
      .values({
        contactId,
        groupId,
      })
      .returning()

    return NextResponse.json(newMember[0], { status: 201 })
  } catch (error) {
    console.error("Error adding member to group:", error)
    return NextResponse.json(
      { error: "Error al agregar miembro al grupo" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    const groupId = parseInt(params.id)

    if (!contactId) {
      return NextResponse.json(
        { error: "ID del contacto es requerido" },
        { status: 400 }
      )
    }

    const deletedMember = await db
      .delete(contactGroupMembers)
      .where(
        and(
          eq(contactGroupMembers.contactId, parseInt(contactId)),
          eq(contactGroupMembers.groupId, groupId)
        )
      )
      .returning()

    if (deletedMember.length === 0) {
      return NextResponse.json(
        { error: "Miembro no encontrado en el grupo" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Miembro removido del grupo exitosamente" })
  } catch (error) {
    console.error("Error removing member from group:", error)
    return NextResponse.json(
      { error: "Error al remover miembro del grupo" },
      { status: 500 }
    )
  }
}