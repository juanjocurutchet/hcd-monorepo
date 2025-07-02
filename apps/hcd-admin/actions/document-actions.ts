"use server"

import {
    getDocumentById as getById,
    deleteDocument as remove,
} from "@/lib/services/document-service"

import { getDocuments as fetchDocuments } from "@/lib/services/document-service"
import { DocumentType } from "@/types/document"

export async function getDocumentById(id: number): Promise<DocumentType | null> {
  try {
    const result = await getById(id)
    if (!result) return null
    return {
      id: result.id ?? 0,
      title: result.title ?? "",
      type: result.type ?? "",
      number: String(result.approval_number ?? ""),
      published_at: result.created_at ?? new Date(),
      isPublished: typeof result.is_active === "boolean" ? result.is_active : true,
      file_url: result.file_url ?? undefined,
      description: result.notes ?? undefined,
    }
  } catch (error) {
    console.error("Error al obtener documento:", error)
    return null
  }
}

export async function deleteDocument(id: number): Promise<{ success: boolean }> {
  try {
    await remove(id)
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar documento:", error)
    return { success: false }
  }
}

export async function getDocuments(params: {
  limit?: number
  offset?: number
  onlyPublished?: boolean
}): Promise<DocumentType[]> {
  try {
    return await fetchDocuments(params)
  } catch (error) {
    console.error("Error al obtener documentos:", error)
    return []
  }
}