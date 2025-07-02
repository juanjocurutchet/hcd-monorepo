import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { getAllCommissions as fetchAllCommissions } from "@/lib/services/commission-service"
import { and, asc, eq, inArray, sql } from "drizzle-orm"

export type CouncilMember = {
  id: number
  name: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  position: string | null
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

export async function getAllPoliticalBlocksWithPresident(): Promise<(PoliticalBlock & {
  president: {
    id: number
    name: string
    imageUrl: string | null
    position: string | null
    blockName: string | null
  } | null
})[]> {
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
      blocks.map(async (block) => {
        let president = null

        if (block.presidentId !== null) {
          const result = await db
            .select({
              id: councilMembers.id,
              name: councilMembers.name,
              imageUrl: councilMembers.imageUrl,
              position: councilMembers.position,
              blockName: politicalBlocks.name,
            })
            .from(councilMembers)
            .leftJoin(politicalBlocks, eq(councilMembers.blockId, politicalBlocks.id))
            .where(eq(councilMembers.id, block.presidentId))
            .limit(1)

          president = result[0] || null
        }

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(councilMembers)
          .where(and(eq(councilMembers.blockId, block.id), eq(councilMembers.isActive, true)))

        return {
          ...block,
          memberCount: Number(countResult[0].count || 0),
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

// actions/concejal-actions.ts

export async function updateCouncilMember(id: number, formData: FormData, userId: string, role: string) {
  const response = await fetch(`/api/concejales/${id}`, {
    method: "PUT",
    body: formData,
    headers: {
      "x-user-id": userId,
      "x-user-role": role,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error al actualizar concejal")
  }

  return await response.json()
}

export async function createCouncilMember(formData: FormData, userId: string, role: string) {
  const response = await fetch("/api/concejales", {
    method: "POST",
    body: formData,
    headers: {
      "x-user-id": userId,
      "x-user-role": role,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error al crear concejal")
  }

  return await response.json()
}

export async function getSecretarioHCD() {
  const result = await db.execute(
    sql`SELECT id, name, position, image_url as "imageUrl", NULL as email, NULL as blockName FROM staff WHERE position = 'secretario_hcd' LIMIT 1`
  )
  return result.rows[0] || null
}

export async function getSecretarioByBlockId(blockId: number) {
  const result = await db.execute(
    sql`SELECT s.*, s.image_url as "imageUrl", pb.name as blockName FROM staff s LEFT JOIN political_blocks pb ON s.block_id = pb.id WHERE s.position = 'secretario_bloque' AND s.block_id = ${blockId} LIMIT 1`
  )
  return result.rows[0] || null
}

export const getAllCommissions = fetchAllCommissions
