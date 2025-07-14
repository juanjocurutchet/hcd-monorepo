"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApiRequest } from "@/hooks/useApiRequest"; // ✅ Importar hook
import { DatePicker } from "antd"
import esES from 'antd/es/date-picker/locale/es_ES'
import dayjs from 'dayjs'
import { AlertCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"

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

  // Estado para proyectos en sesión
  const [proyectos, setProyectos] = useState<any[]>([])
  const [showProyectos, setShowProyectos] = useState(false)
  const [nuevoProyecto, setNuevoProyecto] = useState({
    expedienteNumber: "",
    fechaIngreso: null as dayjs.Dayjs | null,
    origen: "",
    origenOtro: "",
    titulo: "",
    descripcion: "",
    archivo: null as File | null,
  })
  const [bloques, setBloques] = useState<any[]>([])
  const [showTablaProyectos, setShowTablaProyectos] = useState(false)
  const [savingProyecto, setSavingProyecto] = useState<number | null>(null)
  const [deletingProyecto, setDeletingProyecto] = useState<number | null>(null)

  useEffect(() => {
    // Obtener bloques políticos para el select de origen
    fetch("/api/political-blocks")
      .then(res => res.json())
      .then(data => setBloques(data))
      .catch(() => setBloques([]))
  }, [])

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

  const handleAddProyecto = () => {
    if (!nuevoProyecto.expedienteNumber || !nuevoProyecto.fechaIngreso || !nuevoProyecto.titulo) return
    setProyectos(prev => [
      ...prev,
      {
        ...nuevoProyecto,
        origen: nuevoProyecto.origen === "otros" ? nuevoProyecto.origenOtro : nuevoProyecto.origen,
        fechaIngreso: nuevoProyecto.fechaIngreso,
        archivo: nuevoProyecto.archivo,
      },
    ])
    setNuevoProyecto({ expedienteNumber: "", fechaIngreso: null, origen: "", origenOtro: "", titulo: "", descripcion: "", archivo: null })
  }

  const handleRemoveProyecto = (idx: number) => {
    setProyectos(prev => prev.filter((_, i) => i !== idx))
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

      // ✅ Formatear proyectos para enviar
      const proyectosData = proyectos.map(p => ({
        expedienteNumber: p.expedienteNumber,
        fechaIngreso: p.fechaIngreso,
        origen: p.origen,
        titulo: p.titulo,
        descripcion: p.descripcion,
        archivo: p.archivo,
      }))
      data.append("proyectos", JSON.stringify(proyectosData))

      const url = sesion ? `/api/sessions/${sesion.id}` : "/api/sessions"
      const method = sesion ? "PUT" : "POST"

      // ✅ Usar hook en lugar de fetch manual
      await apiRequest(url, {
        method,
        body: data,
        headers: {} // Vacío para FormData
      })

      router.push("/admin-panel-dashboard/sesiones")
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha y Tipo */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value: any) => handleSelectChange("type", value)}>
              <SelectTrigger id="type" className="w-full">
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
            className="w-full"
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
            className="w-full"
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
            className="w-full"
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
            className="w-full"
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
        {/* Bloque colapsable para proyectos */}
        <div className="border rounded-lg mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left"
            onClick={() => setShowProyectos(v => !v)}
          >
            <span className="font-semibold text-[#0e4c7d]">Agregar proyectos a la sesión</span>
            {showProyectos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showProyectos && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Expte N°</Label>
                  <Input
                    value={nuevoProyecto.expedienteNumber}
                    onChange={e => setNuevoProyecto(p => ({ ...p, expedienteNumber: e.target.value }))}
                    placeholder="Ej: 1234/2024"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Fecha de ingreso</Label>
                  <DatePicker
                    value={nuevoProyecto.fechaIngreso}
                    format="DD-MM-YYYY"
                    locale={esES}
                    onChange={date => setNuevoProyecto(p => ({ ...p, fechaIngreso: date && date.isValid() ? date : null }))}
                    allowClear={false}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <Label>Origen</Label>
                  <Select
                    value={nuevoProyecto.origen}
                    onValueChange={value => setNuevoProyecto(p => ({ ...p, origen: value }))}
                  >
                    <SelectTrigger id="origen" className="w-full">
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloques.map((bloque: any) => (
                        <SelectItem key={bloque.id} value={bloque.name}>{bloque.name}</SelectItem>
                      ))}
                      <SelectItem value="Departamento Ejecutivo">Departamento Ejecutivo</SelectItem>
                      <SelectItem value="Vecinos">Vecinos</SelectItem>
                      <SelectItem value="Comunicación Oficial">Comunicación Oficial</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  {nuevoProyecto.origen === "otros" && (
                    <Input
                      className="mt-2 w-full"
                      value={nuevoProyecto.origenOtro}
                      onChange={e => setNuevoProyecto(p => ({ ...p, origenOtro: e.target.value }))}
                      placeholder="Ingrese el origen"
                    />
                  )}
                </div>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={nuevoProyecto.titulo}
                    onChange={e => setNuevoProyecto(p => ({ ...p, titulo: e.target.value }))}
                    placeholder="Título del proyecto"
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={nuevoProyecto.descripcion}
                    onChange={e => setNuevoProyecto(p => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Descripción del proyecto"
                    rows={2}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Adjuntar archivo</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setNuevoProyecto(p => ({ ...p, archivo: e.target.files?.[0] || null }))}
                    className="w-full"
                  />
                  {nuevoProyecto.archivo && (
                    <div className="text-xs text-gray-600 mt-1">Archivo seleccionado: {nuevoProyecto.archivo.name}</div>
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="button" onClick={handleAddProyecto} disabled={!nuevoProyecto.expedienteNumber || !nuevoProyecto.fechaIngreso || !nuevoProyecto.titulo}>
                    Agregar proyecto
                  </Button>
                </div>
              </div>
              {proyectos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Proyectos agregados</h4>
                  <ul className="space-y-2">
                    {proyectos.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-4 bg-gray-50 rounded p-2">
                        <div className="flex-1">
                          <div className="font-medium">Expte N°: {p.expedienteNumber}</div>
                          <div className="text-sm text-gray-600">Fecha ingreso: {p.fechaIngreso ? dayjs(p.fechaIngreso).format("DD-MM-YYYY") : ""}</div>
                          <div className="text-sm text-gray-600">Origen: {p.origen}</div>
                          <div className="text-sm text-gray-600">Título: {p.titulo}</div>
                          <div className="text-sm text-gray-600">{p.descripcion}</div>
                          {p.archivo && (
                            <div className="text-xs text-gray-600 mt-1">Archivo: {p.archivo.name}</div>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveProyecto(idx)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#0e4c7d] hover:bg-[#0a3d68]" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : sesion ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}