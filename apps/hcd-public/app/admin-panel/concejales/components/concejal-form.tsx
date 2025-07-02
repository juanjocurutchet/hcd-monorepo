"use client"

import type { CouncilMember, PoliticalBlockWithPresident } from "@/actions/council-actions";
import { useApiRequest } from "@/hooks/useApiRequest"; // ✅ Importar hook
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ConcejalFormProps {
  bloques: PoliticalBlockWithPresident[]
  concejal?: CouncilMember | null
}

export default function ConcejalForm({ concejal, bloques }: ConcejalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // ✅ Verificar autenticación
    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const url = concejal?.id ? `/api/council-members/${concejal.id}` : "/api/council-members/create"
    const method = concejal?.id ? "PUT" : "POST"

    try {
      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(url, {
        method,
        body: formData,
        headers: {} // Vacío para FormData
      })

      setSuccess(concejal ? "Concejal actualizado correctamente" : "Concejal creado correctamente")
      router.push("/admin-panel/concejales")
      router.refresh()
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Error desconocido")
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={concejal?.name || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
        <select
          id="position"
          name="position"
          defaultValue={concejal?.position || "concejal"}
          className="mt-1 block w-full border rounded-md px-3 py-2"
          required
        >
          <option value="concejal">Concejal</option>
          <option value="presidente_bloque">Presidente de bloque</option>
        </select>
      </div>

      <div>
        <label htmlFor="seniorPosition" className="block text-sm font-medium text-gray-700">Cargo superior</label>
        <select
          id="seniorPosition"
          name="seniorPosition"
          defaultValue={concejal?.seniorPosition || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        >
          <option value="">Sin cargo superior</option>
          <option value="presidente_hcd">Presidente - H. Concejo Deliberante</option>
          <option value="vicepresidente1_hcd">Vicepresidente 1° - H. Concejo Deliberante</option>
          <option value="vicepresidente2_hcd">Vicepresidente 2° - H. Concejo Deliberante</option>
        </select>
      </div>

      <div>
        <label htmlFor="blockId" className="block text-sm font-medium text-gray-700">Bloque Político</label>
        <select
          id="blockId"
          name="blockId"
          defaultValue={concejal?.blockId?.toString() || "-1"}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        >
          <option value="-1">Sin bloque asignado</option>
          {bloques.map((bloque) => (
            <option key={bloque.id} value={bloque.id}>{bloque.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mandate" className="block text-sm font-medium text-gray-700">Mandato</label>
        <input
          type="text"
          id="mandate"
          name="mandate"
          defaultValue={concejal?.mandate || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={concejal?.bio || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Foto</label>
        <input
          type="file"
          id="image"
          name="image"
          className="mt-1 block w-full"
          accept="image/*"
        />
      </div>

      <div className="flex items-center">
        <input
          type="hidden"
          name="isActive"
          value="false"
        />
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          value="true"
          defaultChecked={concejal?.isActive ?? true}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Activo</label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
        >
          {isLoading ? "Guardando..." : concejal ? "Actualizar Concejal" : "Crear Concejal"}
        </button>
      </div>
    </form>
  )
}