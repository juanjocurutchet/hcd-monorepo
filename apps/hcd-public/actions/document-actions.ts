"use server"

import {
  searchDocuments as search,
  getDocumentById as getById,
  deleteDocument as remove,
} from "@/services/documentService"

import { getDocuments as fetchDocuments } from "@/lib/services/document-service"
import { DocumentType } from "@/types/document"

export async function searchDocuments(query?: string): Promise<DocumentType[]> {
  try {
    return await search(query)
  } catch (error) {
    console.error("Error al buscar documentos:", error)
    return []
  }
}

export async function getDocumentById(id: number): Promise<DocumentType | null> {
  try {
    return await getById(id)
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
