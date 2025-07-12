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

    // Mapear los campos de snake_case a camelCase
    return (result as any[]).map(session => ({
      ...session,
      isPublished: session.is_published,
      agendaFileUrl: session.agenda_file_url,
      minutesFileUrl: session.minutes_file_url,
      audioFileUrl: session.audio_file_url,
      videoUrl: session.video_url,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    })) as Session[]
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
    if (Array.isArray(result) && result[0]) {
      const session = result[0] as any;
      return {
        ...session,
        isPublished: session.is_published,
        agendaFileUrl: session.agenda_file_url,
        minutesFileUrl: session.minutes_file_url,
        audioFileUrl: session.audio_file_url,
        videoUrl: session.video_url,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      } as Session;
    }
    return null;
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

    // Obtener fecha en formato YYYY-MM-DD
    const fechaStr = session.date instanceof Date
      ? session.date.toISOString().split('T')[0]
      : String(session.date).split('T')[0];

    if (session.agendaFile && session.agendaFile.size > 0) {
      const ext = session.agendaFile.name.split('.').pop();
      const publicId = `sesiones/acta-${fechaStr}.${ext}`;
      agendaFileUrl = await uploadFile(session.agendaFile, "sesiones", publicId);
    }

    if (session.minutesFile && session.minutesFile.size > 0) {
      const ext = session.minutesFile.name.split('.').pop();
      const publicId = `sesiones/orden_del_dia-${fechaStr}.${ext}`;
      minutesFileUrl = await uploadFile(session.minutesFile, "sesiones", publicId);
    }

    if (session.audioFile && session.audioFile.size > 0) {
      const ext = session.audioFile.name.split('.').pop();
      const publicId = `sesiones/audio_sesion-${fechaStr}.${ext}`;
      audioFileUrl = await uploadFile(session.audioFile, "sesiones", publicId);
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

    if (Array.isArray(updated) && updated[0]) {
      const sessionData = updated[0] as any;
      return {
        ...sessionData,
        isPublished: sessionData.is_published,
        agendaFileUrl: sessionData.agenda_file_url,
        minutesFileUrl: sessionData.minutes_file_url,
        audioFileUrl: sessionData.audio_file_url,
        videoUrl: sessionData.video_url,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at
      } as Session;
    }
    return null;
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

    // Obtener fecha en formato YYYY-MM-DD
    const fechaStr = session.date instanceof Date
      ? session.date.toISOString().split('T')[0]
      : String(session.date).split('T')[0];

    // Subir archivos si existen, con nombre personalizado
    if (session.agendaFile && session.agendaFile.size > 0) {
      const ext = session.agendaFile.name.split('.').pop();
      const publicId = `sesiones/acta-${fechaStr}.${ext}`;
      agendaFileUrl = await uploadFile(session.agendaFile, "sesiones", publicId);
    }

    if (session.minutesFile && session.minutesFile.size > 0) {
      const ext = session.minutesFile.name.split('.').pop();
      const publicId = `sesiones/orden_del_dia-${fechaStr}.${ext}`;
      minutesFileUrl = await uploadFile(session.minutesFile, "sesiones", publicId);
    }

    if (session.audioFile && session.audioFile.size > 0) {
      const ext = session.audioFile.name.split('.').pop();
      const publicId = `sesiones/audio_sesion-${fechaStr}.${ext}`;
      audioFileUrl = await uploadFile(session.audioFile, "sesiones", publicId);
    }

    const result = await sql`
      INSERT INTO sessions (
        date, type, agenda_file_url, minutes_file_url, audio_file_url, video_url, is_published
      ) VALUES (
        ${session.date}, ${session.type}, ${agendaFileUrl}, ${minutesFileUrl}, ${audioFileUrl}, ${session.videoUrl}, ${session.isPublished}
      )
      RETURNING *
    `

    if (Array.isArray(result) && result[0]) {
      const sessionData = result[0] as any;
      return {
        ...sessionData,
        isPublished: sessionData.is_published,
        agendaFileUrl: sessionData.agenda_file_url,
        minutesFileUrl: sessionData.minutes_file_url,
        audioFileUrl: sessionData.audio_file_url,
        videoUrl: sessionData.video_url,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at
      } as Session;
    }
    return null;
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }
}

// ... puedes agregar el resto de las funciones según sea necesario ...