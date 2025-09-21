import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const blockName = searchParams.get('block')

    if (!blockName) {
      return NextResponse.json(
        { error: 'Block name is required' },
        { status: 400 }
      )
    }

    // Buscar el bloque por nombre
    const block = await db
      .select()
      .from(politicalBlocks)
      .where(eq(politicalBlocks.name, blockName))
      .limit(1)

    if (!block.length) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      )
    }

    // Obtener los miembros del bloque
    const members = await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        position: councilMembers.position,
        email: councilMembers.email
      })
      .from(councilMembers)
      .where(eq(councilMembers.blockId, block[0].id))
      .orderBy(councilMembers.name)

    return NextResponse.json({
      success: true,
      block: block[0],
      members
    })

  } catch (error) {
    console.error('Error fetching block members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch block members' },
      { status: 500 }
    )
  }
}