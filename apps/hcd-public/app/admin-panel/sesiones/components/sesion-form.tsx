"use client"

import { ChangeEvent, SetStateAction, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApiRequest } from "@/hooks/useApiRequest" // ✅ Importar hook

interface Sesion {
  id?: string;
  date?: string;
  type?: string;
  videoUrl?: string;
  isPublished?: boolean;
}

export function SesionForm({ sesion = null }: { sesion?: Sesion | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const [formData, setFormData] = useState({
    date: sesion?.date ? new Date(sesion.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    type: sesion?.type || "ordinaria",
    videoUrl: sesion?.videoUrl || "",
    isPublished: sesion?.isPublished || false,
  })

  const [agendaFile, setAgendaFile] = useState<File | null>(null)
  const [minutesFile, setMinutesFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const handleChange = (e: { target: { name: any; value: any; type: any; checked: any } }) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (value: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
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
      if (!formData.date) {
        throw new Error("La fecha es requerida")
      }

      if (!formData.type) {
        throw new Error("El tipo de sesión es requerido")
      }

      const data = new FormData()

      // ✅ Formatear fecha para evitar problemas de timezone
      const [year, month, day] = formData.date.split('-')
      const formattedDate = `${year}-${month}-${day}`

      data.append("date", formattedDate)
      data.append("type", formData.type)
      data.append("videoUrl", formData.videoUrl)
      data.append("isPublished", formData.isPublished.toString())

      if (agendaFile && agendaFile.size > 0) {
        data.append("agendaFile", agendaFile)
      }
      if (minutesFile && minutesFile.size > 0) {
        data.append("minutesFile", minutesFile)
      }
      if (audioFile && audioFile.size > 0) {
        data.append("audioFile", audioFile)
      }

      const url = sesion ? `/api/sessions/${sesion.id}` : "/api/sessions/create"
      const method = sesion ? "PUT" : "POST"

      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(url, {
        method,
        body: data,
        headers: {} // Vacío para FormData
      })

      router.push("/admin-panel/sesiones")
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value: any) => handleSelectChange("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordinaria">Ordinaria</SelectItem>
                  <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                  <SelectItem value="preparatoria">Preparatoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agendaFile">Orden del día</Label>
            <Input
              id="agendaFile"
              name="agendaFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, setAgendaFile)}
            />
            {agendaFile && (
              <p className="text-sm text-green-600">Archivo seleccionado: {agendaFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesFile">Acta</Label>
            <Input
              id="minutesFile"
              name="minutesFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, setMinutesFile)}
            />
            {minutesFile && (
              <p className="text-sm text-green-600">Archivo seleccionado: {minutesFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioFile">Audio</Label>
            <Input
              id="audioFile"
              name="audioFile"
              type="file"
              accept=".mp3,.wav,.ogg,.m4a"
              onChange={(e) => handleFileChange(e, setAudioFile)}
            />
            {audioFile && (
              <p className="text-sm text-green-600">Archivo seleccionado: {audioFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del video</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="URL del video (YouTube, Vimeo, etc.)"
            />
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
              {isSubmitting ? "Guardando..." : sesion ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}