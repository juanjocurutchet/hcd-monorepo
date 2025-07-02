import { db } from "@/lib/db-singleton"
import { contactMessages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAllMessages() {
  return await db.select().from(contactMessages).orderBy(contactMessages.createdAt)
}

export async function getMessageById(id: number) {
  const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id))
  return result[0] || null
}

export async function deleteMessage(id: number) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id))
}

export async function markMessageAsRead(id: number) {
  await db
    .update(contactMessages)
    .set({ isRead: true, updatedAt: new Date() })
    .where(eq(contactMessages.id, id))
}