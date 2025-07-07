import { db } from "@/lib/db-singleton"
import { contacts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const allContacts = await db
      .select()
      .from(contacts)
      .where(eq(contacts.isActive, true))
      .orderBy(contacts.name)

    return NextResponse.json(allContacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Error al obtener contactos" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, position } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      )
    }

    const newContact = await db
      .insert(contacts)
      .values({
        name,
        email,
        position: position || null,
        isActive: true,
      })
      .returning()

    return NextResponse.json(newContact[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating contact:", error)

    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: "Ya existe un contacto con ese email" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error al crear contacto" },
      { status: 500 }
    )
  }
}