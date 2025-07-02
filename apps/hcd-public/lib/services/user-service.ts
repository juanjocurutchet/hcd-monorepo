import { db } from "@/lib/db-singleton"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAllUsers() {
  try {
    return await db.select().from(users)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

export async function getUserById(id: number) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return null
  }
}
