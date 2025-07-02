"use server"

import { sql } from "@/lib/db"
import { desc } from "drizzle-orm"
import { sessions } from "../db/schema"
import { db } from "../db-singleton"
import { uploadFile } from "../storage"
import { PoliticalBlockWithPresident } from "@/actions/council-actions"

export type CouncilMember = {
  id: number
  name: string
  position: string | null
  blockId: number
  blockName?: string
  mandate: string | null
  imageUrl: string | null
  bio: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type PoliticalBlock = {
  id: number
  name: string
  presidentId: number | null
  color: string | null
  description: string | null
  memberCount: number
}

export type Session = {
  id: number
  date: Date
  type: string
  agendaFileUrl: string | null
  minutesFileUrl: string | null
  audioFileUrl: string | null
  videoUrl: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export async function getActiveCouncilMembers(): Promise<CouncilMember[]> {
  try {
    const result = await sql`
      SELECT id, name, position, block_id as "blockId", mandate, image_url as "imageUrl", bio, is_active as "isActive"
      FROM council_members
      WHERE is_active = true
      ORDER BY
        CASE
          WHEN position = 'Presidente' THEN 1
          WHEN position LIKE 'Vicepresidente%' THEN 2
          ELSE 3
        END,
        name
    `
    return result as CouncilMember[]
  } catch (error) {
    console.error("Error fetching active council members:", error)
    return []
  }
}

export async function getAllCouncilMembers(): Promise<CouncilMember[]> {
  try {
    const result = await sql`
      SELECT
        cm.id,
        cm.name,
        cm.position,
        cm.block_id as "blockId",
        pb.name as "blockName",
        cm.mandate,
        cm.image_url as "imageUrl",
        cm.bio,
        cm.is_active as "isActive"
      FROM council_members cm
      LEFT JOIN political_blocks pb ON cm.block_id = pb.id
      ORDER BY
        CASE
          WHEN cm.position = 'Presidente' THEN 1
          WHEN cm.position LIKE 'Vicepresidente%' THEN 2
          ELSE 3
        END,
        cm.name
    `
    return result as CouncilMember[]
  } catch (error) {
    console.error("Error fetching all council members:", error)
    return []
  }
}

export async function getPoliticalBlocks(): Promise<PoliticalBlock[]> {
  try {
    const result = await sql`
      SELECT id, name, president_id as "presidentId", color
      FROM political_blocks
      ORDER BY name
    `
    return result as PoliticalBlock[]
  } catch (error) {
    console.error("Error fetching political blocks:", error)
    return []
  }
}

export async function getAllPoliticalBlocks(): Promise<PoliticalBlockWithPresident[]> {
  try {
    const blocks = await sql`
      SELECT
        pb.id,
        pb.name,
        pb.color,
        pb.president_id as "presidentId",
        cm.id as "president_id",
        cm.name as "president_name",
        cm.image_url as "president_imageUrl",
        cm.position as "president_position",
        cm.block_id as "president_blockId",
        cm.mandate as "president_mandate",
        cm.bio as "president_bio",
        cm.is_active as "president_isActive",
        cm.created_at as "president_createdAt",
        cm.updated_at as "president_updatedAt"
      FROM political_blocks pb
      LEFT JOIN council_members cm ON pb.president_id = cm.id
      ORDER BY pb.name
    `

    const blocksWithPresidents = await Promise.all(
      (blocks as any[]).map(async (block) => {
        const countResult = await sql`
          SELECT COUNT(*) as count
          FROM council_members
          WHERE block_id = ${block.id} AND is_active = true
        `

        const president: CouncilMember | null = block.president_id
          ? {
              id: block.president_id,
              name: block.president_name,
              imageUrl: block.president_imageUrl,
              position: block.president_position,
              blockId: block.president_blockId,
              mandate: block.president_mandate,
              bio: block.president_bio,
              isActive: block.president_isActive,
              createdAt: block.president_createdAt,
              updatedAt: block.president_updatedAt,
            }
          : null

        return {
          id: block.id,
          name: block.name,
          color: block.color,
          president,
          memberCount: Number(countResult[0]?.count || 0),
        }
      })
    )

    return blocksWithPresidents
  } catch (error) {
    console.error("Error fetching political blocks:", error)
    return []
  }
}


export async function getCouncilMemberById(id: number): Promise<CouncilMember | null> {
  try {
    const result = await sql`
      SELECT
        cm.id,
        cm.name,
        cm.position,
        cm.block_id as "blockId",
        pb.name as "blockName",
        cm.mandate,
        cm.image_url as "imageUrl",
        cm.bio,
        cm.is_active as "isActive"
      FROM council_members cm
      LEFT JOIN political_blocks pb ON cm.block_id = pb.id
      WHERE cm.id = ${id}
    `
    return (result[0] as CouncilMember) || null
  } catch (error) {
    console.error("Error getting council member by id:", error)
    return null
  }
}

export async function getSessions(options: {
  year?: number
  type?: string
  limit?: number
  offset?: number
  onlyPublished?: boolean
} = {}): Promise<Session[]> {
  try {
    // Para simplificar, usar Drizzle ORM como en el código existente
    const result = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.date))

    // Filtrar en memoria por ahora (menos eficiente pero funcional)
    let filteredResult = result

    if (options.onlyPublished !== false) {
      filteredResult = filteredResult.filter(s => s.isPublished)
    }

    if (options.year) {
      filteredResult = filteredResult.filter(s =>
        new Date(s.date).getFullYear() === options.year
      )
    }

    if (options.type) {
      filteredResult = filteredResult.filter(s => s.type === options.type)
    }

    // Aplicar paginación
    if (options.offset) {
      filteredResult = filteredResult.slice(options.offset)
    }

    if (options.limit) {
      filteredResult = filteredResult.slice(0, options.limit)
    }

    return filteredResult as Session[]
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return []
  }
}

export async function getSessionById(id: number): Promise<Session | null> {
  try {
    const result = await sql`
      SELECT *
      FROM sessions
      WHERE id = ${id}
    `
    return (result[0] as Session) || null
  } catch (error) {
    console.error("Error getting session by id:", error)
    return null
  }
}

export async function updateSession(session: {
  id: number
  date: Date
  type: string
  agendaFile?: File | null
  minutesFile?: File | null
  audioFile?: File | null
  videoUrl?: string
  isPublished: boolean
}) {
  try {
    const result = await sql`
      SELECT agenda_file_url, minutes_file_url, audio_file_url
      FROM sessions
      WHERE id = ${session.id}
    `

    const currentData = (result as any[])[0] || {}

    let agendaFileUrl = currentData.agenda_file_url || null
    let minutesFileUrl = currentData.minutes_file_url || null
    let audioFileUrl = currentData.audio_file_url || null

    if (session.agendaFile && session.agendaFile.size > 0) {
      agendaFileUrl = await uploadFile(session.agendaFile, "sesiones")
    }

    if (session.minutesFile && session.minutesFile.size > 0) {
      minutesFileUrl = await uploadFile(session.minutesFile, "sesiones")
    }

    if (session.audioFile && session.audioFile.size > 0) {
      audioFileUrl = await uploadFile(session.audioFile, "sesiones")
    }

    // ✅ DEBE ser UPDATE, NO DELETE
    const updated = await sql`
      UPDATE sessions
      SET
        date = ${session.date},
        type = ${session.type},
        agenda_file_url = ${agendaFileUrl},
        minutes_file_url = ${minutesFileUrl},
        audio_file_url = ${audioFileUrl},
        video_url = ${session.videoUrl},
        is_published = ${session.isPublished},
        updated_at = NOW()
      WHERE id = ${session.id}
      RETURNING *
    `

    return (updated as Session[])[0]
  } catch (error) {
    console.error("Error updating session:", error)
    throw error
  }
}

export async function deleteSession(id: number) {
  try {
    await sql`
      DELETE FROM sessions
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error) {
    console.error("Error deleting session:", error)
    throw error
  }
}

export async function createSession(session: {
  date: Date
  type: string
  agendaFile?: File | null
  minutesFile?: File | null
  audioFile?: File | null
  videoUrl?: string
  isPublished: boolean
}) {
  try {
    let agendaFileUrl = null
    let minutesFileUrl = null
    let audioFileUrl = null

    // Subir archivos si existen
    if (session.agendaFile && session.agendaFile.size > 0) {
      agendaFileUrl = await uploadFile(session.agendaFile, "sesiones")
    }

    if (session.minutesFile && session.minutesFile.size > 0) {
      minutesFileUrl = await uploadFile(session.minutesFile, "sesiones")
    }

    if (session.audioFile && session.audioFile.size > 0) {
      audioFileUrl = await uploadFile(session.audioFile, "sesiones")
    }

    const result = await sql`
      INSERT INTO sessions (
        date, type, agenda_file_url, minutes_file_url, audio_file_url, video_url, is_published
      ) VALUES (
        ${session.date}, ${session.type}, ${agendaFileUrl}, ${minutesFileUrl}, ${audioFileUrl}, ${session.videoUrl}, ${session.isPublished}
      )
      RETURNING *
    `

    return (result as Session[])[0]
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// También añadir esta función que se usa en el endpoint público
export async function getSessionsCount(options: {
  year?: number
  type?: string
  onlyPublished: boolean
}): Promise<number> {
  try {
    // Obtener todas y contar en memoria (simple pero funcional)
    const allSessions = await getSessions({
      onlyPublished: options.onlyPublished,
      year: options.year,
      type: options.type
    })

    return allSessions.length
  } catch (error) {
    console.error("Error getting sessions count:", error)
    return 0
  }
}