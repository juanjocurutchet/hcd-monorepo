"use client"

import type { CouncilMember, PoliticalBlockWithPresident } from "@/actions/council-actions";
import { useApiRequest } from "@/hooks/useApiRequest"; // ✅ Importar hook
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ConcejalFormProps {
  bloques: PoliticalBlockWithPresident[]
  concejal?: CouncilMember | null
  onConcejalUpdated?: (concejal: CouncilMember) => void
}

export default function ConcejalForm({ concejal, bloques, onConcejalUpdated }: ConcejalFormProps) {
  console.log("concejal recibido en el form:", concejal);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  // Estado controlado para el formulario
  const [formData, setFormData] = useState({
    name: concejal?.name || "",
    position: concejal?.position || "concejal",
    seniorPosition: concejal?.seniorPosition || "",
    blockId: concejal?.blockId?.toString() || "-1",
    mandate: concejal?.mandate || "",
    bio: concejal?.bio || "",
    isActive: concejal?.isActive ?? true,
  })

  // Actualizar el estado cuando cambie el concejal
  useEffect(() => {
    console.log("Concejal actualizado en useEffect:", concejal)
    if (concejal) {
      const newFormData = {
        name: concejal.name || "",
        position: concejal.position || "concejal",
        seniorPosition: concejal.seniorPosition || "",
        blockId: concejal.blockId?.toString() || "-1",
        mandate: concejal.mandate || "",
        bio: concejal.bio || "",
        isActive: concejal.isActive ?? true,
      }
      console.log("Nuevo formData:", newFormData)
      setFormData(newFormData)
    }
  }, [concejal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

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

    const submitFormData = new FormData()
    submitFormData.append("name", formData.name)
    submitFormData.append("position", formData.position)
    submitFormData.append("seniorPosition", formData.seniorPosition)
    submitFormData.append("blockId", formData.blockId === "-1" ? "" : formData.blockId)
    submitFormData.append("mandate", formData.mandate)
    submitFormData.append("bio", formData.bio)
    submitFormData.append("isActive", formData.isActive.toString())

    // Agregar imagen si existe
    const imageInput = e.currentTarget.querySelector('input[name="image"]') as HTMLInputElement
    if (imageInput?.files?.[0]) {
      submitFormData.append("image", imageInput.files[0])
    }

    const url = concejal?.id ? `/api/council-members/${concejal.id}` : "/api/council-members"
    const method = concejal?.id ? "PUT" : "POST"

    try {
      // ✅ Usar hook en lugar de fetch manual
      const result = await apiRequest(url, {
        method,
        body: submitFormData,
        headers: {} // Vacío para FormData
      })

      setSuccess(concejal ? "Concejal actualizado correctamente" : "Concejal creado correctamente")

      // Redirigir después de un breve delay para mostrar el mensaje de éxito
      setTimeout(() => {
        window.location.href = "/admin-panel-dashboard/concejales"
      }, 1500)
      router.refresh()
      onConcejalUpdated?.(result || concejal!) // Llamar a la función de actualización
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
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">Cargo</label>
        <select
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
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
          value={formData.seniorPosition}
          onChange={handleChange}
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
          value={formData.blockId}
          onChange={handleChange}
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
          value={formData.mandate}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
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
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
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