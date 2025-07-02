import { sql } from "@/lib/db"
import { News } from "@/types/news"

const SELECT_FIELDS = sql`
  id, title, content, excerpt, published_at, is_published as "isPublished", image_url, author
`

export async function getAllNews(): Promise<News[]> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM news
    ORDER BY published_at DESC
  `
  return result as unknown as News[]
}

export async function getNewsById(id: number): Promise<News | null> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM news
    WHERE id = ${id}
  `
  return result[0] as unknown as News ?? null
}

export async function deleteNews(id: number): Promise<void> {
  await sql`DELETE FROM news WHERE id = ${id}`
}
