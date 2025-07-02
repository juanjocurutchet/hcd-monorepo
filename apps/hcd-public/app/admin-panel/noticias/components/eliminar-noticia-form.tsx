"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useApiRequest } from "@/hooks/useApiRequest" // ✅ Importar hook

interface EliminarNoticiaFormProps {
  noticia: {
    id: number
    title: string
  }
}

export default function EliminarNoticiaForm({ noticia }: EliminarNoticiaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const handleDelete = async () => {
    // ✅ Verificar autenticación
    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(`/api/news/${noticia.id}`, {
        method: "DELETE"
      })

      router.push("/admin-panel/noticias")
      router.refresh()
    } catch (err: any) {
      console.error("Error al eliminar noticia:", err)
      setError(err.message || "Error al eliminar la noticia")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Mostrar mensaje si no está autenticado
  if (!isAuthenticated) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No autorizado. Por favor, inicia sesión.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              ¿Estás seguro de que quieres eliminar esta noticia?
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Se eliminará permanentemente la noticia <strong>"{noticia.title}"</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Eliminando..." : "Eliminar Noticia"}
        </Button>
      </div>
    </div>
  )
}