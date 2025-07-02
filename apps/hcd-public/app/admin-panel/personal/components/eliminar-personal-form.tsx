"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function EliminarPersonalForm({ personal }: { personal: { id: number, name: string } }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/personal/${personal.id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el personal")
      }
      router.push("/admin-panel/personal")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "No se pudo eliminar el personal.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">¿Estás seguro de que quieres eliminar este personal?</h3>
        <p className="mt-2 text-sm text-red-700">
          Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{personal.name}</strong> del sistema.
        </p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-4">
        <button type="button" className="px-4 py-2 border rounded-md" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </button>
        <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Eliminando..." : "Eliminar Personal"}
        </button>
      </div>
    </div>
  )
}