import { sql } from "@/lib/db"
import { DocumentType } from "@/types/document"

const SELECT_FIELDS = sql`
  id, title, type, number, published_at, is_published as "isPublished", file_url, description
`

export async function searchDocuments(query?: string): Promise<DocumentType[]> {
  if (!query || query.trim() === "") {
    const result = await sql`
      SELECT ${SELECT_FIELDS}
      FROM documents
      ORDER BY published_at DESC
      LIMIT 50
    `
    return result as unknown as DocumentType[]
  }

  const searchTerm = `%${query}%`
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM documents
    WHERE title ILIKE ${searchTerm}
       OR type ILIKE ${searchTerm}
       OR number ILIKE ${searchTerm}
       OR description ILIKE ${searchTerm}
    ORDER BY published_at DESC
    LIMIT 50
  `
  return result as unknown as DocumentType[]}


export async function getDocumentById(id: number): Promise<DocumentType | null> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM documents
    WHERE id = ${id}
  `
  return result[0] as unknown as DocumentType ?? null
}

export async function deleteDocument(id: number): Promise<void> {
  await sql`DELETE FROM documents WHERE id = ${id}`
}
