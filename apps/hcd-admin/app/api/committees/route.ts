import { db } from "@/lib/db-singleton"
import { committeeMembers, committees, councilMembers } from "@/lib/db/schema"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
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
        presidentName: councilMembers.name
      })
      .from(committees)
      .leftJoin(councilMembers, eq(committees.presidentId, councilMembers.id))
      .orderBy(committees.name)

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error fetching committees:", error)
    return NextResponse.json({ error: "Error al obtener las comisiones" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Cache-Control": "no-store" } })
    }
    const body = await request.json()
    const memberIds = Array.isArray(body.memberIds) ? body.memberIds : []
    const [newCommittee] = await db.insert(committees).values(body).returning()
    // Insertar miembros en committee_members
    if (newCommittee && newCommittee.id && memberIds.length > 0) {
      await db.insert(committeeMembers).values(
        memberIds.map((councilMemberId: number) => ({
          committeeId: newCommittee.id,
          councilMemberId: Number(councilMemberId),
        }))
      )
    }
    return NextResponse.json(newCommittee, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error creating committee:", error)
    return NextResponse.json({ error: "Error al crear la comisión" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}