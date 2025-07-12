import { db } from "@/lib/db-singleton"
import { contactGroupMembers, contactGroups } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const allGroups = await db
      .select({
        id: contactGroups.id,
        name: contactGroups.name,
        description: contactGroups.description,
        createdAt: contactGroups.createdAt,
        updatedAt: contactGroups.updatedAt,
      })
      .from(contactGroups)
      .orderBy(contactGroups.name)

    // Para cada grupo, obtener el conteo de miembros
    const groupsWithMembers = await Promise.all(
      allGroups.map(async (group: { id: number; name: string; description: string | null; createdAt: Date; updatedAt: Date }) => {
        const memberCount = await db
          .select({ count: sql`count(*)` })
          .from(contactGroupMembers)
          .where(eq(contactGroupMembers.groupId, group.id))

        return {
          ...group,
          memberCount: Number(memberCount[0]?.count || 0),
          members: [] // Inicialmente vacío, se cargará cuando se necesite
        }
      })
    )

    return NextResponse.json(groupsWithMembers)
  } catch (error) {
    console.error("Error fetching contact groups:", error)
    return NextResponse.json(
      { error: "Error al obtener grupos de contactos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: "Nombre del grupo es requerido" },
        { status: 400 }
      )
    }

    const newGroup = await db
      .insert(contactGroups)
      .values({
        name,
        description: description || null,
      })
      .returning()

    return NextResponse.json(newGroup[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating contact group:", error)

    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: "Ya existe un grupo con ese nombre" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear grupo de contactos" },
      { status: 500 }
    )
  }
}