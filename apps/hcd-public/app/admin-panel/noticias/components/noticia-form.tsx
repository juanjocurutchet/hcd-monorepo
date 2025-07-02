"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApiRequest } from "@/hooks/useApiRequest" // ✅ Importar hook

interface Noticia {
  id?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  isPublished?: boolean;
}

export function NoticiaForm({ noticia = null }: { noticia?: Noticia | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const [formData, setFormData] = useState({
    title: noticia?.title || "",
    content: noticia?.content || "",
    excerpt: noticia?.excerpt || "",
    isPublished: noticia?.isPublished || false,
  })

  const [image, setImage] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setImage(files[0])
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

      if (!formData.content.trim()) {
        throw new Error("El contenido es requerido")
      }

      const data = new FormData()
      data.append("title", formData.title.trim())
      data.append("content", formData.content.trim())
      data.append("excerpt", formData.excerpt.trim())
      data.append("isPublished", formData.isPublished.toString())

      if (image && image.size > 0) {
        data.append("image", image)
      }

      const url = noticia?.id ? `/api/news/${noticia.id}` : "/api/news/create"
      const method = noticia?.id ? "PUT" : "POST"

      // ✅ Usar hook en lugar de server actions
      await apiRequest(url, {
        method,
        body: data,
        headers: {} // Vacío para FormData
      })

      router.push("/admin-panel/noticias")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error desconocido")
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
              placeholder="Título de la noticia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Breve resumen de la noticia"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Contenido completo de la noticia"
              rows={10}
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
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked: any) => setFormData({ ...formData, isPublished: !!checked })}
            />
            <Label htmlFor="isPublished">Publicar inmediatamente</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#0e4c7d] hover:bg-[#0a3d68]" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : noticia ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}