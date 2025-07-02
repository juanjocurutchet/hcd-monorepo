"use server"
import { db } from "@/lib/db-singleton";
import { sessions } from "@/lib/db/schema";
import { desc, eq, isNotNull, and } from "drizzle-orm";

export async function getLatestSessions() {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.isPublished, true))
    .orderBy(desc(sessions.date))
    .limit(5);

  return result;
}

export async function getSessionAgendas(limit = 20) {
  return db
    .select({
      id: sessions.id,
      date: sessions.date,
      type: sessions.type,
      agendaFileUrl: sessions.agendaFileUrl,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.isPublished, true),
        isNotNull(sessions.agendaFileUrl)
      )
    )
    .orderBy(desc(sessions.date))
    .limit(limit)
}

export async function getSessionMinutes(limit = 20) {
  return db
    .select({
      id: sessions.id,
      date: sessions.date,
      type: sessions.type,
      minutesFileUrl: sessions.minutesFileUrl,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.isPublished, true),
        isNotNull(sessions.minutesFileUrl)
      )
    )
    .orderBy(desc(sessions.date))
    .limit(limit)
}

export async function getSessionAudios(limit = 20) {
  return db
    .select({
      id: sessions.id,
      date: sessions.date,
      type: sessions.type,
      audioFileUrl: sessions.audioFileUrl,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.isPublished, true),
        isNotNull(sessions.audioFileUrl)
      )
    )
    .orderBy(desc(sessions.date))
    .limit(limit)
}