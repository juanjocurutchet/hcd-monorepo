"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteDocument } from "@/actions/document-actions"

interface EliminarDocumentoFormProps {
  documento: {
    id: number
    title: string
  }
}

export default function EliminarDocumentoForm({ documento }: EliminarDocumentoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteDocument(documento.id)
      router.push("/admin-panel/documentos")
    } catch (error) {
      console.error("Error al eliminar documento:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">¿Estás seguro de que quieres eliminar este documento?</h3>
        <p className="mt-2 text-sm text-red-700">
          Esta acción no se puede deshacer. Se eliminará permanentemente el documento <strong>{documento.title}</strong>{" "}
          del sistema.
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Eliminando..." : "Eliminar Documento"}
        </Button>
      </div>
    </div>
  )
}
