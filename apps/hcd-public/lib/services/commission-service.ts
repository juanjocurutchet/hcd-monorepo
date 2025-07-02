import { db } from "@/lib/db-singleton"
import { committeeMembers, committees, councilMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAllCommissions() {
  try {
    const result = await db
      .select({
        id: committees.id,
        name: committees.name,
        description: committees.description,
        presidentId: committees.presidentId,
        secretaryId: committees.secretaryId,
        isActive: committees.isActive,
        createdAt: committees.createdAt,
        updatedAt: committees.updatedAt,
        presidentName: councilMembers.name, // ✅ Nombre del presidente
      })
      .from(committees)
      .leftJoin(councilMembers, eq(committees.presidentId, councilMembers.id))

    return result
  } catch (error) {
    console.error("Error fetching commissions:", error)
    return []
  }
}

export async function getCommissionById(id: number) {
  try {
    // Traer la comisión
    const result = await db
      .select()
      .from(committees)
      .where(eq(committees.id, id))
      .limit(1)

    const comision = result[0]
    if (!comision) return null

    // Traer los miembros asociados
    const miembros = await db
      .select({ id: councilMembers.id, name: councilMembers.name })
      .from(committeeMembers)
      .leftJoin(councilMembers, eq(committeeMembers.councilMemberId, councilMembers.id))
      .where(eq(committeeMembers.committeeId, id))

    return {
      ...comision,
      members: miembros
    }
  } catch (error) {
    console.error("Error fetching commission by id:", error)
    return null
  }
}