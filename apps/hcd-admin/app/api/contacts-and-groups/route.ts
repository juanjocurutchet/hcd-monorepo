import { db } from "@/lib/db-singleton"
import { contactGroupMembers, contactGroups, contacts } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Obtener todos los contactos activos
    const allContacts = await db
      .select()
      .from(contacts)
      .where(eq(contacts.isActive, true))
      .orderBy(contacts.name)

    // Obtener todos los grupos
    const allGroups = await db
      .select()
      .from(contactGroups)
      .orderBy(contactGroups.name)

    // Para cada grupo, obtener sus miembros
    const groupsWithMembers = await Promise.all(
      allGroups.map(async (group) => {
        const members = await db
          .select({
            id: contactGroupMembers.id,
            contactId: contactGroupMembers.contactId,
            contact: {
              id: contacts.id,
              name: contacts.name,
              email: contacts.email,
              position: contacts.position,
            }
          })
          .from(contactGroupMembers)
          .innerJoin(contacts, eq(contactGroupMembers.contactId, contacts.id))
          .where(
            and(
              eq(contactGroupMembers.groupId, group.id),
              eq(contacts.isActive, true)
            )
          )
          .orderBy(contacts.name)

        return {
          ...group,
          members,
          memberCount: members.length
        }
      })
    )

    return NextResponse.json({
      contacts: allContacts,
      groups: groupsWithMembers
    })
  } catch (error) {
    console.error("Error fetching contacts and groups:", error)
    return NextResponse.json(
      { error: "Error al obtener contactos y grupos" },
      { status: 500 }
    )
  }
}