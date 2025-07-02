import { sql } from "drizzle-orm"
import { news } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { uploadFile, deleteFile } from "@/lib/storage"
import slugify from "slugify"
import { db } from "../db-singleton"
import { News } from "@/types/news"

export type NewsInput = {
  title: string
  content: string
  excerpt?: string
  image?: File | null
  authorId: number
  isPublished?: boolean
}

export type NewsUpdateInput = Partial<NewsInput> & {
  id: number
}

export async function createNews(input: NewsInput) {
  let imageUrl = null

  if (input.image) {
    imageUrl = await uploadFile(input.image, "news")
  }

  const slug = slugify(input.title, { lower: true, strict: true })

  const result = await db
    .insert(news)
    .values({
      title: input.title,
      content: input.content,
      excerpt: input.excerpt || input.content.substring(0, 150) + "...",
      imageUrl,
      authorId: input.authorId,
      slug,
      isPublished: input.isPublished ?? true,
    })
    .returning()

  return result[0]
}

export async function updateNews(input: NewsUpdateInput) {
  const currentNews = await db.select().from(news).where(eq(news.id, input.id)).limit(1)

  if (!currentNews.length) {
    throw new Error("Noticia no encontrada")
  }

  let imageUrl = currentNews[0].imageUrl

  if (input.image) {
    // Si hay una imagen anterior, eliminarla
    if (imageUrl) {
      await deleteFile(imageUrl)
    }
    imageUrl = await uploadFile(input.image, "news")
  }

  let slug = currentNews[0].slug
  if (input.title && input.title !== currentNews[0].title) {
    slug = slugify(input.title, { lower: true, strict: true })
  }

  const result = await db
    .update(news)
    .set({
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      imageUrl,
      slug,
      isPublished: input.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(news.id, input.id))
    .returning()

  return result[0]
}

export async function deleteNews(id: number) {
  const newsItem = await db.select().from(news).where(eq(news.id, id)).limit(1)

  if (!newsItem.length) {
    throw new Error("Noticia no encontrada")
  }

  // Si hay una imagen, eliminarla
  if (newsItem[0].imageUrl) {
    await deleteFile(newsItem[0].imageUrl)
  }

  await db.delete(news).where(eq(news.id, id))

  return { success: true }
}

export async function getNewsById(id: number) {
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1)
  return result[0] || null
}

export async function getNewsBySlug(slug: string) {
  const result = await db.select().from(news).where(eq(news.slug, slug)).limit(1)
  return result[0] || null
}

export async function getLatestNews(limit = 10, offset = 0, onlyPublished = true) {
  // Construir condiciones
  const conditions = onlyPublished ? [eq(news.isPublished, true)] : []

  // Ejecutar consulta con condiciones
  const result = await db
    .select()
    .from(news)
    .where(and(...conditions))
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset)

  return result
}

export async function searchNews(searchTerm: string, limit = 10, offset = 0) {
  const query = searchTerm.replace(/ /g, " & ")

  const result = await db
    .select()
    .from(news)
    .where(
      and(
        sql<boolean>`to_tsvector('spanish', ${news.title} || ' ' || ${news.content}) @@ to_tsquery('spanish', ${query})`,
        eq(news.isPublished, true),
      ),
    )
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset)

  return result
}

export async function getNewsCount(onlyPublished = true) {
  // Construir condiciones
  const conditions = onlyPublished ? [eq(news.isPublished, true)] : []

  // Ejecutar consulta con condiciones
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(news)
    .where(and(...conditions))

  return result[0].count
}

export async function getAllNews(limit = 10, offset = 0): Promise<News[]> {
  return await db
    .select()
    .from(news)
    .orderBy(desc(news.publishedAt))
    .limit(limit)
    .offset(offset)
}

