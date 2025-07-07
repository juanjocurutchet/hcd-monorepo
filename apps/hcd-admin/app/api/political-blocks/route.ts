import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // JOIN para traer presidente y contar miembros activos
    const blocks = await db
      .select({
        id: politicalBlocks.id,
        name: politicalBlocks.name,
        color: politicalBlocks.color,
        description: politicalBlocks.description,
        presidentId: politicalBlocks.presidentId,
      })
      .from(politicalBlocks)

    // Para cada bloque, traer presidente y contar miembros activos
    const blocksWithDetails = await Promise.all(
      blocks.map(async (block) => {
        let president = null
        if (block.presidentId !== null) {
          const result = await db
            .select({
              id: councilMembers.id,
              name: councilMembers.name,
              imageUrl: councilMembers.imageUrl,
              position: councilMembers.position,
            })
            .from(councilMembers)
            .where(eq(councilMembers.id, block.presidentId))
            .limit(1)
          if (result[0]) president = result[0]
        }
        const countResult = await db
          .select({ id: councilMembers.id })
          .from(councilMembers)
          .where(eq(councilMembers.blockId, block.id))
        const memberCount = countResult.length
        return {
          ...block,
          president,
          memberCount,
        }
      })
    )
    return NextResponse.json(blocksWithDetails, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    })
  } catch (error) {
    console.error("Error fetching political blocks:", error)
    return NextResponse.json({ error: "Error al obtener los bloques" }, { status: 500 })
  }
}