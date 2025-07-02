// NO usar "use server" porque estas funciones hacen fetch desde el cliente con headers

import {
  getAllNews as fetchAll,
  getNewsById as fetchById,
} from "@/services/newsService"

import { News } from "@/types/news"

export async function getAllNews(): Promise<News[]> {
  try {
    return await fetchAll()
  } catch (error) {
    console.error("Error al obtener noticias:", error)
    return []
  }
}

export async function getNewsById(id: number): Promise<News | null> {
  try {
    return await fetchById(id)
  } catch (error) {
    console.error("Error al obtener noticia:", error)
    return null
  }
}

export async function deleteNews(id: number, userId: string, role: string) {
  const response = await fetch(`/api/news/${id}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId,
      "x-user-role": role,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Error al eliminar la noticia")
  }

  return true
}

export async function updateNews(id: number, formData: FormData, userId: string, role: string) {
  const response = await fetch(`/api/news/${id}`, {
    method: "PUT",
    body: formData,
    headers: {
      "x-user-id": userId,
      "x-user-role": role,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Error al actualizar la noticia")
  }

  return await response.json()
}

export async function createNews(formData: FormData, userId: string, role: string) {
  const response = await fetch("/api/news/create", {
    method: "POST",
    body: formData,
    headers: {
      "x-user-id": userId,
      "x-user-role": role,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Error al crear la noticia")
  }

  return await response.json()
}
