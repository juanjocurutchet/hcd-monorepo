import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { and, asc, eq, inArray, sql } from "drizzle-orm"

export type CouncilMember = {
  id: number
  name: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  position: string | null
  seniorPosition: string | null
  blockId: number | null
  mandate: string | null
  bio: string | null
  isActive: boolean
}

export type CouncilMemberWithBlock = CouncilMember & {
  blockName: string | null
}

export type PoliticalBlock = {
  id: number
  name: string
  presidentId: number | null
  color: string | null
  description: string | null
  memberCount: number
}

export type PoliticalBlockWithPresident = {
  id: number
  name: string
  color: string | null
  memberCount: number
  president: CouncilMember | null
}


export async function getActiveCouncilMembersByBlock() {
  return await db
    .select({
      id: councilMembers.id,
      name: councilMembers.name,
      position: councilMembers.position,
      imageUrl: councilMembers.imageUrl,
      bio: councilMembers.bio,
      blockId: councilMembers.blockId,
      mandate: councilMembers.mandate,
      isActive: councilMembers.isActive,
      blockName: politicalBlocks.name,
      blockColor: politicalBlocks.color,
      seniorPosition: councilMembers.seniorPosition,
    })
    .from(councilMembers)
    .leftJoin(politicalBlocks, eq(councilMembers.blockId, politicalBlocks.id))
    .where(eq(councilMembers.isActive, true))
}

export async function getAuthorities() {
  return await db
    .select({
      id: councilMembers.id,
      name: councilMembers.name,
      position: councilMembers.position,
      seniorPosition: councilMembers.seniorPosition,
      imageUrl: councilMembers.imageUrl,
      email: councilMembers.email,
      blockName: politicalBlocks.name,
    })
    .from(councilMembers)
    .leftJoin(politicalBlocks, eq(councilMembers.blockId, politicalBlocks.id))
    .where(
      and(
        eq(councilMembers.isActive, true),
        inArray(sql`${councilMembers.seniorPosition}`, [
          "presidente_hcd",
          "vicepresidente1_hcd",
          "vicepresidente2_hcd"
        ])
      )
    )
}

export async function getAllPoliticalBlocksWithPresident(): Promise<PoliticalBlockWithPresident[]> {
  try {
    const blocks = await db
      .select({
        id: politicalBlocks.id,
        name: politicalBlocks.name,
        presidentId: politicalBlocks.presidentId,
        color: politicalBlocks.color,
        description: politicalBlocks.description,
      })
      .from(politicalBlocks)
      .orderBy(asc(politicalBlocks.name))

    const blocksWithDetails = await Promise.all(
      blocks.map(async (block: { id: number; name: string; presidentId: number | null; color: string | null; description: string | null }) => {
        let president: CouncilMember | null = null

        if (block.presidentId !== null) {
          const result = await db
            .select({
              id: councilMembers.id,
              name: councilMembers.name,
              imageUrl: councilMembers.imageUrl,
              createdAt: councilMembers.createdAt,
              updatedAt: councilMembers.updatedAt,
              position: councilMembers.position,
              seniorPosition: councilMembers.seniorPosition,
              blockId: councilMembers.blockId,
              mandate: councilMembers.mandate,
              bio: councilMembers.bio,
              isActive: councilMembers.isActive,
            })
            .from(councilMembers)
            .where(eq(councilMembers.id, block.presidentId))
            .limit(1)

          if (result[0]) {
            president = result[0]
          }
        }

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(councilMembers)
          .where(and(eq(councilMembers.blockId, block.id), eq(councilMembers.isActive, true)))

        return {
          id: block.id,
          name: block.name,
          color: block.color,
          memberCount: Number(countResult[0]?.count ?? 0),
          president,
        }
      })
    )

    return blocksWithDetails
  } catch (error) {
    console.error("Error al obtener bloques:", error)
    return []
  }
}

export async function getCouncilMembersByBlock(blockId: number): Promise<CouncilMember[]> {
  try {
    return await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        imageUrl: councilMembers.imageUrl,
        createdAt: councilMembers.createdAt,
        updatedAt: councilMembers.updatedAt,
        position: councilMembers.position,
        seniorPosition: councilMembers.seniorPosition,
        blockId: councilMembers.blockId,
        mandate: councilMembers.mandate,
        bio: councilMembers.bio,
        isActive: councilMembers.isActive,
      })
      .from(councilMembers)
      .where(and(eq(councilMembers.blockId, blockId), eq(councilMembers.isActive, true)))
      .orderBy(asc(councilMembers.name))
  } catch (error) {
    console.error("Error al obtener concejales del bloque:", error)
    return []
  }
}

export async function getCouncilMemberById(id: number): Promise<CouncilMember | null> {
  try {
    const result = await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        imageUrl: councilMembers.imageUrl,
        createdAt: councilMembers.createdAt,
        updatedAt: councilMembers.updatedAt,
        position: councilMembers.position,
        seniorPosition: councilMembers.seniorPosition,
        blockId: councilMembers.blockId,
        mandate: councilMembers.mandate,
        bio: councilMembers.bio,
        isActive: councilMembers.isActive,
      })
      .from(councilMembers)
      .where(eq(councilMembers.id, id))
      .limit(1)
    return result[0] || null
  } catch (error) {
    console.error("Error al obtener concejal por id:", error)
    return null
  }
}

export async function getPoliticalBlockById(id: number) {
  try {
    // Obtener el bloque
    const blockResult = await db
      .select({
        id: politicalBlocks.id,
        name: politicalBlocks.name,
        presidentId: politicalBlocks.presidentId,
        color: politicalBlocks.color,
        description: politicalBlocks.description,
      })
      .from(politicalBlocks)
      .where(eq(politicalBlocks.id, id))
      .limit(1)

    if (!blockResult[0]) return null
    const block = blockResult[0]

    // Obtener presidente
    let president = null
    if (block.presidentId) {
      const presidentResult = await db
        .select({
          id: councilMembers.id,
          name: councilMembers.name,
          position: councilMembers.position,
          seniorPosition: councilMembers.seniorPosition,
          imageUrl: councilMembers.imageUrl,
          createdAt: councilMembers.createdAt,
          updatedAt: councilMembers.updatedAt,
          blockId: councilMembers.blockId,
          mandate: councilMembers.mandate,
          bio: councilMembers.bio,
          isActive: councilMembers.isActive,
        })
        .from(councilMembers)
        .where(eq(councilMembers.id, block.presidentId))
        .limit(1)
      president = presidentResult[0] || null
    }

    // Obtener miembros activos
    const members = await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        position: councilMembers.position,
        seniorPosition: councilMembers.seniorPosition,
        imageUrl: councilMembers.imageUrl,
        createdAt: councilMembers.createdAt,
        updatedAt: councilMembers.updatedAt,
        blockId: councilMembers.blockId,
        mandate: councilMembers.mandate,
        bio: councilMembers.bio,
        isActive: councilMembers.isActive,
      })
      .from(councilMembers)
      .where(and(eq(councilMembers.blockId, id), eq(councilMembers.isActive, true)))

    return {
      id: block.id,
      name: block.name,
      color: block.color,
      description: block.description,
      president,
      members,
    }
  } catch (error) {
    console.error("Error al obtener bloque por id:", error)
    return null
  }
}