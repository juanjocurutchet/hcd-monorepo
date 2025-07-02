"use server"

import { sql } from "@/lib/db-singleton"
import { uploadFile } from "@/lib/storage"

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

export async function getSessions(options: {
  year?: number
  type?: string
  limit?: number
  offset?: number
  onlyPublished?: boolean
} = {}): Promise<Session[]> {
  try {
    let query = `SELECT * FROM sessions WHERE 1=1`
    const params: any[] = []

    if (options.onlyPublished !== false) {
      query += ` AND is_published = true`
    }
    if (options.year) {
      query += ` AND EXTRACT(YEAR FROM date) = $${params.length + 1}`
      params.push(options.year)
    }
    if (options.type) {
      query += ` AND type = $${params.length + 1}`
      params.push(options.type)
    }
    query += ` ORDER BY date DESC`
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`
      params.push(options.limit)
    }
    if (options.offset) {
      query += ` OFFSET $${params.length + 1}`
      params.push(options.offset)
    }

    const result = await sql.query(query, params)
    console.log("SESIONES EN DB:", result);
    return result as Session[]
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
    return result[0] || null
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

    return updated[0]
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

    return result[0]
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// ... puedes agregar el resto de las funciones según sea necesario ...