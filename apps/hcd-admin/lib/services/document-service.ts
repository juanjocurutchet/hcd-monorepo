import { ordinance_modifica, ordinances } from "@/lib/db/schema"
import { deleteFile } from "@/lib/storage"
import { DocumentType } from "@/types/document"
import { eq, sql } from "drizzle-orm"
import { db } from "../db-singleton"

export type OrdinanceInput = {
  approval_number: number
  title: string
  year: number
  type: string
  category: string
  notes?: string
  is_active?: boolean
  file_url?: string
  slug?: string
  modificadasIds?: number[]
  derogadasIds?: number[]
}

export type OrdinanceUpdateInput = Partial<OrdinanceInput> & { id: number }

export async function createOrdinance(input: OrdinanceInput & { estado?: string, derogada_por_numero?: string }) {
  const [ordinance] = await db.insert(ordinances).values({
    approval_number: input.approval_number,
    title: input.title,
    year: input.year,
    type: input.type,
    category: input.category,
    notes: input.notes,
    is_active: input.is_active ?? true,
    file_url: input.file_url,
    slug: input.slug,
  }).returning()

  // Guardar relaciones modificatorias
  if (Array.isArray(input.modificadasIds) && input.modificadasIds.length > 0 && ordinance) {
    for (const modificadaId of input.modificadasIds) {
      await db.insert(ordinance_modifica).values({ ordinance_id: modificadaId, modificadora_numero: ordinance.approval_number })
    }
  }
  // Guardar relaciones derogadas (no se puede usar derogada_por, solo desactivar is_active)
  if (Array.isArray(input.derogadasIds) && input.derogadasIds.length > 0 && ordinance) {
    for (const derogadaId of input.derogadasIds) {
      await db.update(ordinances).set({ is_active: false }).where(eq(ordinances.id, derogadaId))
    }
  }
  // Si el estado es derogada y se especifica derogada_por_numero, solo desactivar is_active
  if (input.estado === "derogada" && input.derogada_por_numero && ordinance) {
    await db.update(ordinances)
      .set({ is_active: false })
      .where(eq(ordinances.id, ordinance.id))
  }
  return ordinance
}

export async function updateOrdinance(input: OrdinanceUpdateInput & { estado?: string, derogada_por_numero?: string }) {
  const [ordinance] = await db.update(ordinances)
    .set({
      approval_number: input.approval_number,
      title: input.title,
      year: input.year,
      type: input.type,
      category: input.category,
      notes: input.notes,
      is_active: input.is_active,
      file_url: input.file_url,
      slug: input.slug,
    })
    .where(eq(ordinances.id, input.id))
    .returning()

  // Limpiar relaciones anteriores
  if (ordinance) {
    await db.delete(ordinance_modifica).where(eq(ordinance_modifica.modificadora_numero, ordinance.approval_number))
  }

  // Guardar relaciones modificatorias
  if (Array.isArray(input.modificadasIds) && input.modificadasIds.length > 0 && ordinance) {
    for (const modificadaId of input.modificadasIds) {
      await db.insert(ordinance_modifica).values({ ordinance_id: modificadaId, modificadora_numero: ordinance.approval_number })
    }
  }
  // Guardar relaciones derogadas (no se puede usar derogada_por, solo desactivar is_active)
  if (Array.isArray(input.derogadasIds) && input.derogadasIds.length > 0 && ordinance) {
    for (const derogadaId of input.derogadasIds) {
      await db.update(ordinances).set({ is_active: false }).where(eq(ordinances.id, derogadaId))
    }
  }
  // Si el estado es derogada y se especifica derogada_por_numero, solo desactivar is_active
  if (input.estado === "derogada" && input.derogada_por_numero && ordinance) {
    await db.update(ordinances)
      .set({ is_active: false })
      .where(eq(ordinances.id, ordinance.id))
  }
  return ordinance
}

export async function getDocumentById(id: number) {
  const result = await db.select().from(ordinances).where(eq(ordinances.id, id)).limit(1)

  if (!result.length) {
    return null
  }

  const ordinance = result[0]
  if (!ordinance) return null;

  // Buscar ordenanzas que esta ordenanza modifica
  const modificaRows = await db.select({ ordinance_id: ordinance_modifica.ordinance_id })
    .from(ordinance_modifica)
    .where(eq(ordinance_modifica.modificadora_numero, ordinance.approval_number))

  const modificaIds = modificaRows.map(row => row.ordinance_id).filter(Boolean)
  let modificaOrdenanzas: any[] = []
  if (modificaIds.length > 0) {
    modificaOrdenanzas = await db.select().from(ordinances).where(sql`id = ANY(${modificaIds})`)
  }

  return {
    ...ordinance,
    modificaOrdenanzas
  }
}

export async function deleteDocument(id: number) {
  const currentDoc = await db.select().from(ordinances).where(eq(ordinances.id, id)).limit(1)

  if (!currentDoc.length || !currentDoc[0]) {
    throw new Error("Documento no encontrado")
  }

  const fileUrl = currentDoc[0].file_url

  // Si hay un archivo asociado, eliminarlo
  if (fileUrl) {
    await deleteFile(fileUrl)
  }

  await db.delete(ordinances).where(eq(ordinances.id, id))

  return { success: true }
}

export async function getDocuments({
  limit = 10,
  offset = 0,
  onlyPublished = true,
}: {
  limit?: number
  offset?: number
  onlyPublished?: boolean
}): Promise<DocumentType[]> {
  const conditions = onlyPublished
    ? sql`WHERE is_active = true`
    : sql``

  const result = await db.execute<DocumentType>(sql`
    SELECT id, title, type, approval_number, year, is_active as "isPublished"
    FROM ordinances
    ${conditions}
    ORDER BY approval_number DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `)

  return result.rows
}