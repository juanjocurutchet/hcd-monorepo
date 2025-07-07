import { db } from "@/lib/db-singleton"
import { councilMembers } from "@/lib/db/schema"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await db.select().from(councilMembers).orderBy(councilMembers.name)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching council members:", error)
    return NextResponse.json({ error: "Error al obtener los concejales" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const [newMember] = await db.insert(councilMembers).values(body).returning()
    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Error creating council member:", error)
    return NextResponse.json({ error: "Error al crear el concejal" }, { status: 500 })
  }
}