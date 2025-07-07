import { db } from "@/lib/db-singleton"
import { committees, councilMembers } from "@/lib/db/schema"
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching committees:", error)
    return NextResponse.json({ error: "Error al obtener las comisiones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const [newCommittee] = await db.insert(committees).values(body).returning()
    return NextResponse.json(newCommittee)
  } catch (error) {
    console.error("Error creating committee:", error)
    return NextResponse.json({ error: "Error al crear la comisión" }, { status: 500 })
  }
}