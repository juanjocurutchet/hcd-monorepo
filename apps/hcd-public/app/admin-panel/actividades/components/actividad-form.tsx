"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useApiRequest } from "@/hooks/useApiRequest" // ✅ Importar hook

interface Actividad {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
  isPublished?: boolean;
  imageUrl?: string;
}

export function ActividadForm({ actividad = null }: { actividad?: Actividad | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const [formData, setFormData] = useState({
    title: actividad?.title || "",
    description: actividad?.description || "",
    date: actividad?.date ? new Date(actividad.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isPublished: actividad?.isPublished ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    // ✅ Verificar autenticación
    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // ✅ Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error("El título es requerido")
      }

      if (!formData.description.trim()) {
        throw new Error("La descripción es requerida")
      }

      if (!formData.date) {
        throw new Error("La fecha es requerida")
      }

      const data = new FormData()
      data.append("title", formData.title.trim())
      data.append("description", formData.description.trim())

      // ✅ Convertir fecha de YYYY-MM-DD a Date ISO string
      const selectedDate = new Date(formData.date)
      data.append("date", selectedDate.toISOString())

      data.append("isPublished", formData.isPublished.toString())

      if (image && image.size > 0) {
        data.append("image", image)
      }

      const url = actividad ? `/api/activities/${actividad.id}` : "/api/activities/create"
      const method = actividad ? "PUT" : "POST"

      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(url, {
        method,
        body: data,
        headers: {} // Vacío para FormData
      })

      router.push("/admin-panel/actividades")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido")
      }
    } finally {
      setIsSubmitting(false)
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Título de la actividad"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de la actividad"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagen</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {image && (
              <p className="text-sm text-green-600">Archivo seleccionado: {image.name}</p>
            )}
            {actividad?.imageUrl && !image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Imagen actual:</p>
                <img
                  src={actividad.imageUrl || "/placeholder.svg"}
                  alt={actividad.title}
                  className="mt-1 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked: any) => setFormData({ ...formData, isPublished: !!checked })}
            />
            <Label htmlFor="isPublished">Publicada</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#0e4c7d] hover:bg-[#0a3d68]" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : actividad ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}