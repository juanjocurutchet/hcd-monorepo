import { sql } from "@/lib/db"

export async function getAllStaff() {
  return await sql`
    SELECT s.*, s.image_url as "imageUrl", pb.name as blockName
    FROM staff s
    LEFT JOIN political_blocks pb ON s.block_id = pb.id
    ORDER BY s.name
  `
}

export async function getStaffById(id: number) {
  const result = await sql`
    SELECT s.*, pb.name as blockName
    FROM staff s
    LEFT JOIN political_blocks pb ON s.block_id = pb.id
    WHERE s.id = ${id}
  `
  return result[0] || null
}