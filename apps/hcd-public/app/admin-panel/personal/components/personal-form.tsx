"use client"

import { useApiRequest } from "@/hooks/useApiRequest"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PersonalFormProps {
  bloques: { id: number; name: string }[]
  personal?: any | null
}

const cargos = [
  { value: "secretario_hcd", label: "Secretario/a - H. Concejo Deliberante" },
  { value: "secretario_bloque", label: "Secretario/a de Bloque" },
  { value: "administrativo", label: "Administrativo" },
  { value: "maestranza", label: "Maestranza" },
  { value: "otro", label: "Otro" },
]

export default function PersonalForm({ personal, bloques }: PersonalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [cargo, setCargo] = useState(personal?.position || "secretario_hcd")
  const router = useRouter()
  const { apiRequest, isAuthenticated } = useApiRequest()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }
    setIsLoading(true)
    setError("")
    setSuccess("")
    const formData = new FormData(e.currentTarget)
    const url = personal?.id ? `/api/personal/${personal.id}` : "/api/personal/create"
    const method = personal?.id ? "PUT" : "POST"
    try {
      await apiRequest(url, { method, body: formData, headers: {} })
      setSuccess(personal ? "Personal actualizado correctamente" : "Personal creado correctamente")
      router.push("/admin-panel/personal")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

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
          defaultValue={personal?.name || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
        <select
          id="position"
          name="position"
          value={cargo}
          onChange={e => setCargo(e.target.value)}
          className="mt-1 block w-full border rounded-md px-3 py-2"
          required
        >
          {cargos.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      {cargo === "secretario_bloque" && (
        <div>
          <label htmlFor="blockId" className="block text-sm font-medium text-gray-700">Bloque Político</label>
          <select
            id="blockId"
            name="blockId"
            defaultValue={personal?.blockId?.toString() || "-1"}
            className="mt-1 block w-full border rounded-md px-3 py-2"
          >
            <option value="-1">Sin bloque asignado</option>
            {bloques.map((bloque) => (
              <option key={bloque.id} value={bloque.id}>{bloque.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={personal?.bio || ""}
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
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={personal?.email || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="text"
          id="telefono"
          name="telefono"
          defaultValue={personal?.telefono || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">Facebook</label>
        <input
          type="text"
          id="facebook"
          name="facebook"
          defaultValue={personal?.facebook || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram</label>
        <input
          type="text"
          id="instagram"
          name="instagram"
          defaultValue={personal?.instagram || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">Twitter</label>
        <input
          type="text"
          id="twitter"
          name="twitter"
          defaultValue={personal?.twitter || ""}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
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
          {isLoading ? "Guardando..." : personal ? "Actualizar Personal" : "Crear Personal"}
        </button>
      </div>
    </form>
  )
}