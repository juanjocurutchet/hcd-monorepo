import { sql } from "@/lib/db"
import { PoliticalBlock } from "./session-service"

export async function getPoliticalBlockById(id: number): Promise<PoliticalBlock | null> {
  try {
    const result = await sql`
      SELECT id, name, president_id, color, description
      FROM political_blocks
      WHERE id = ${id}
    `
    return (result[0] as PoliticalBlock) || null
  } catch (error) {
    console.error("Error getting political block by id:", error)
    return null
  }
}
