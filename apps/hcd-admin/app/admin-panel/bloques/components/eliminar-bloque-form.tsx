"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PoliticalBlockWithPresident } from "@/actions/council-actions"
import { useApiRequest } from "@/hooks/useApiRequest" // ✅ Importar hook

interface EliminarBloqueFormProps {
  bloque: PoliticalBlockWithPresident
}

export default function EliminarBloqueForm({ bloque }: EliminarBloqueFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ Verificar autenticación
    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(`/api/political-blocks/${bloque.id}`, {
        method: "DELETE",
      })

      router.push("/admin-panel/bloques")
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Mostrar mensaje si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">No autorizado. Por favor, inicia sesión.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              ¿Estás seguro de que quieres eliminar este bloque político?
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Se eliminará permanentemente el bloque <strong>"{bloque.name}"</strong>. Esta acción no se puede
                deshacer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Eliminando..." : "Eliminar Bloque"}
        </button>
      </div>
    </form>
  )
}