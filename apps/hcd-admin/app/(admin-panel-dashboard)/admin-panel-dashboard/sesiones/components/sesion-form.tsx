"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApiRequest } from "@/hooks/useApiRequest"
import { DatePicker } from "antd"
import esES from "antd/locale/es_ES"
import dayjs from "dayjs"
import { AlertCircle, ChevronDown, ChevronUp, Edit, Save, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useState } from "react"
import SessionProviderWrapper from "../../../../admin-panel/SessionProviderWrapper"

// Mapeo de orígenes a prefijos predefinidos
const ORIGEN_PREFIX_MAP: { [key: string]: string } = {
  "Bloque Todos Por Las Flores": "FTxLF",
  "Bloque Adelante Juntos": "AJ",
  "Bloque La Libertad Avanza": "LLA",
  "Departamento Ejecutivo": "DE",
  "Comunicaciones oficiales": "COF",
  "Parlamento Estudiantil": "PE",
  "Vecinos": "V"
}

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
  const { apiRequest, isAuthenticated } = useApiRequest()

  // Usar dayjs para el DatePicker
  const [formData, setFormData] = useState({
    date: sesion?.date ? dayjs(sesion.date) : dayjs(),
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
    numeroExpediente: "",
    fechaEntrada: null as dayjs.Dayjs | null,
    titulo: "",
    descripcion: "",
    origen: "",
    origenPersonalizado: "",
    prefijoOrigen: "",
    tipo: "",
    tipoPersonalizado: "",
    archivo: null as File | null,
  })

  // Estado para edición de proyectos existentes
  const [editProyectos, setEditProyectos] = useState<any[]>([])
  const [showTablaProyectos, setShowTablaProyectos] = useState(false)
  const [savingProyecto, setSavingProyecto] = useState<number | null>(null)
  const [deletingProyecto, setDeletingProyecto] = useState<number | null>(null)
  const [editOrigenPersonalizado, setEditOrigenPersonalizado] = useState<{ [key: number]: string }>({})
  const [editTipoPersonalizado, setEditTipoPersonalizado] = useState<{ [key: number]: string }>({})
  const [editingProyecto, setEditingProyecto] = useState<number | null>(null)
  const [proyectoError, setProyectoError] = useState("")

  // Cargar proyectos existentes al editar
  useEffect(() => {
    if (sesion && sesion.id) {
      console.log("Cargando proyectos para sesión:", sesion.id)
      fetch(`/api/sessions/${sesion.id}/files`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          setEditProyectos(
            data.map((p: any) => ({
              ...p,
              fechaEntrada: p.fechaEntrada ? dayjs(p.fechaEntrada, "YYYY-MM-DD") : null,
            }))
          )
        })
        .catch((error) => {
          console.error("Error al cargar proyectos:", error)
          setEditProyectos([])
        })
    }
  }, [sesion?.id])

  const handleChange = (e: { target: { name: any; value: any; type: any; checked: any } }) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleDateChange = (date: any) => {
    setFormData({
      ...formData,
      date: date && date.isValid() ? date : null,
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

    if (!isAuthenticated) {
      setError("No hay sesión activa")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      if (!formData.date) {
        throw new Error("La fecha es requerida")
      }

      if (!formData.type) {
        throw new Error("El tipo de sesión es requerido")
      }

      const data = new FormData()
      data.append("date", formData.date.format("YYYY-MM-DD"))
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

      const url = sesion ? `/api/sessions/${sesion.id}` : "/api/sessions"
      const method = sesion ? "PUT" : "POST"

      const response = await apiRequest(url, {
        method,
        body: data,
        headers: {}
      })

      if (!sesion) {
        // Si es creación, redirigir a la edición usando el id devuelto
        const resData = await response.json()
        if (resData && resData.id) {
          router.push(`/admin-panel-dashboard/sesiones/${resData.id}`)
          return
        }
      } else {
        router.push("/admin-panel-dashboard/sesiones")
        router.refresh()
      }
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

    // Nuevo handleAddProyecto para edición
  const handleAddProyecto = async () => {
    const origenFinal = nuevoProyecto.origen === "otros" ? nuevoProyecto.origenPersonalizado : nuevoProyecto.origen
    const tipoFinal = nuevoProyecto.tipo === "otro" ? nuevoProyecto.tipoPersonalizado : nuevoProyecto.tipo
    if (!nuevoProyecto.numeroExpediente || !nuevoProyecto.fechaEntrada || !nuevoProyecto.titulo || !origenFinal || !nuevoProyecto.prefijoOrigen || !tipoFinal) {
      setProyectoError("Todos los campos obligatorios deben estar completos")
      return
    }

    setProyectoError("")

    if (sesion && sesion.id) {
      // En edición: enviar a la API
      try {
        const fd = new FormData()
        fd.append("numeroExpediente", nuevoProyecto.numeroExpediente)
        fd.append("fechaEntrada", nuevoProyecto.fechaEntrada ? dayjs(nuevoProyecto.fechaEntrada).format("YYYY-MM-DD") : "")
        fd.append("titulo", nuevoProyecto.titulo)
        fd.append("descripcion", nuevoProyecto.descripcion)
        fd.append("origen", origenFinal)
        fd.append("prefijoOrigen", nuevoProyecto.prefijoOrigen)
        fd.append("tipo", tipoFinal)
        if (nuevoProyecto.archivo) fd.append("archivo", nuevoProyecto.archivo)

        const res = await fetch(`/api/sessions/${sesion.id}/files`, { method: "POST", body: fd })
        if (res.ok) {
          const nuevo = await res.json()
          setEditProyectos(prev => [...prev, nuevo])
          setNuevoProyecto({
            numeroExpediente: "",
            fechaEntrada: null,
            titulo: "",
            descripcion: "",
            origen: "",
            origenPersonalizado: "",
            prefijoOrigen: "",
            tipo: "",
            tipoPersonalizado: "",
            archivo: null
          })
          // Mostrar la tabla de proyectos después de agregar
          setShowTablaProyectos(true)
        } else {
          const errorData = await res.json()
          setProyectoError(errorData.error || "Error al agregar proyecto")
        }
      } catch (error) {
        console.error("Error al agregar proyecto:", error)
        setProyectoError("Error de conexión al agregar proyecto")
      }
    } else {
      // En creación: solo local
      setProyectos(prev => [
        ...prev,
        {
          ...nuevoProyecto,
          origen: origenFinal,
          tipo: tipoFinal,
          archivo: nuevoProyecto.archivo,
        },
      ])
      setNuevoProyecto({
        numeroExpediente: "",
        fechaEntrada: null,
        titulo: "",
        descripcion: "",
        origen: "",
        origenPersonalizado: "",
        prefijoOrigen: "",
        tipo: "",
        tipoPersonalizado: "",
        archivo: null
      })
    }
  }

  const handleRemoveProyecto = (idx: number) => {
    setProyectos(prev => prev.filter((_, i) => i !== idx))
  }

  // Función para eliminar proyecto de la base de datos
  const handleDeleteProyecto = async (idx: number) => {
    if (!sesion?.id) return

    const proyecto = editProyectos[idx]
    if (!proyecto?.id) return

    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return

    setDeletingProyecto(idx)
    try {
      const res = await fetch(`/api/sessions/${sesion.id}/files/${proyecto.id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setEditProyectos(prev => prev.filter((_, i) => i !== idx))
      } else {
        console.error("Error al eliminar proyecto")
        setProyectoError("Error al eliminar proyecto")
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error)
      setProyectoError("Error de conexión al eliminar proyecto")
    } finally {
      setDeletingProyecto(null)
    }
  }

  // Función para iniciar edición de un proyecto
  const handleStartEdit = (idx: number) => {
    setEditingProyecto(idx)
  }

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingProyecto(null)
    setProyectoError("")
  }

  // Guardar cambios individuales
  const handleSaveProyecto = async (idx: number) => {
    if (!sesion?.id) return

    const proyecto = editProyectos[idx]
    if (!proyecto) return

    const origenFinal = proyecto.origen === "otros" ? editOrigenPersonalizado[idx] || "" : proyecto.origen
    const tipoFinal = proyecto.tipo === "otro" ? editTipoPersonalizado[idx] || "" : proyecto.tipo
    if (!origenFinal) {
      console.error("Origen es requerido")
      return
    }
    if (!tipoFinal) {
      console.error("Tipo es requerido")
      return
    }

    setSavingProyecto(idx)
    try {
      const fd = new FormData()
      fd.append("fileId", proyecto.id.toString())
      fd.append("numeroExpediente", proyecto.numeroExpediente)
      fd.append("fechaEntrada", proyecto.fechaEntrada ? dayjs(proyecto.fechaEntrada).format("YYYY-MM-DD") : "")
      fd.append("titulo", proyecto.titulo)
      fd.append("descripcion", proyecto.descripcion || "")
      fd.append("origen", origenFinal)
      fd.append("prefijoOrigen", proyecto.prefijoOrigen)
      fd.append("tipo", tipoFinal)

      const res = await fetch(`/api/sessions/${sesion.id}/files`, {
        method: "PUT",
        body: fd
      })

      if (res.ok) {
        const updated = await res.json()
        setEditProyectos(prev => prev.map((p, i) => i === idx ? { ...updated, origen: origenFinal, tipo: tipoFinal } : p))
        console.log("Proyecto guardado correctamente")
      } else {
        console.error("Error al guardar proyecto")
      }
    } catch (error) {
      console.error("Error al guardar proyecto:", error)
    } finally {
      setSavingProyecto(null)
    }
  }

  const handleEditProyectoChange = (idx: number, field: string, value: any) => {
    setEditProyectos(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  // Función para manejar el cambio de origen y actualizar automáticamente el prefijo
  const handleOrigenChange = (value: string) => {
    const prefijo = ORIGEN_PREFIX_MAP[value] || ""
    setNuevoProyecto(prev => ({
      ...prev,
      origen: value,
      prefijoOrigen: prefijo,
      origenPersonalizado: "" // Limpiar el campo personalizado si cambia el origen
    }))
  }

  // Función para manejar el cambio de origen en la tabla editable
  const handleEditOrigenChange = (idx: number, value: string) => {
    const prefijo = ORIGEN_PREFIX_MAP[value] || ""
    setEditProyectos(prev => prev.map((p, i) =>
      i === idx ? {
        ...p,
        origen: value,
        prefijoOrigen: prefijo
      } : p
    ))
    // Limpiar el campo personalizado si cambia el origen
    if (value !== "otros") {
      setEditOrigenPersonalizado(prev => {
        const newState = { ...prev }
        delete newState[idx]
        return newState
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No autorizado. Por favor, inicia sesión.</AlertDescription>
      </Alert>
    )
  }

  // Si NO hay sesión, solo mostrar el formulario de la sesión
  if (!sesion) {
    return (
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
                            <DatePicker
                  id="date"
                  value={formData.date}
                  format="DD-MM-YYYY"
                  locale={esES as any}
                  onChange={handleDateChange}
                  allowClear={false}
                  style={{ width: '100%' }}
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
            accept=".mp3,.wav,.m4a"
            onChange={(e) => handleFileChange(e, setAudioFile)}
          />
          {audioFile && (
            <p className="text-sm text-green-600">Archivo seleccionado: {audioFile.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">URL del video (opcional)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://..."
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
          <Button type="submit" className="bg-[#0e4c7d] hover:bg-[#0a3d68]" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Crear"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <SessionProviderWrapper>
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
                <DatePicker
                  id="date"
                  value={formData.date}
                  format="DD-MM-YYYY"
                  locale={esES as any}
                  onChange={handleDateChange}
                  allowClear={false}
                  style={{ width: '100%' }}
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
                accept=".mp3,.wav,.m4a"
                onChange={(e) => handleFileChange(e, setAudioFile)}
              />
              {audioFile && (
                <p className="text-sm text-green-600">Archivo seleccionado: {audioFile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL del video (opcional)</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://..."
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

            {/* Bloque desplegable de agregar proyectos */}
            <div className="border rounded-lg mb-6">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left"
                onClick={() => setShowProyectos(v => !v)}
              >
                <span className="font-semibold text-[#0e4c7d]">Agregar proyectos</span>
                {showProyectos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showProyectos && (
                <div className="p-4 space-y-4">
                  {/* Mensaje de error */}
                  {proyectoError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{proyectoError}</AlertDescription>
                    </Alert>
                  )}
                  {/* Formulario para agregar proyecto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <Label>Prefijo origen</Label>
                      <Input
                        value={nuevoProyecto.prefijoOrigen}
                        onChange={e => setNuevoProyecto(p => ({ ...p, prefijoOrigen: e.target.value }))}
                        placeholder="Ej: DE, V, AJ"
                        readOnly={nuevoProyecto.origen !== "otros"}
                        className={nuevoProyecto.origen !== "otros" ? "bg-gray-100" : ""}
                      />
                      {nuevoProyecto.origen !== "otros" && nuevoProyecto.origen && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prefijo automático para {nuevoProyecto.origen}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Número de expediente</Label>
                      <Input
                        value={nuevoProyecto.numeroExpediente}
                        onChange={e => setNuevoProyecto(p => ({ ...p, numeroExpediente: e.target.value }))}
                        placeholder="Ej: 1234/2024"
                      />
                    </div>
                    <div>
                      <Label>Fecha de entrada</Label>
                      <DatePicker
                        value={nuevoProyecto.fechaEntrada}
                        format="DD-MM-YYYY"
                        locale={esES as any}
                        onChange={(date) =>
                          setNuevoProyecto(p => ({
                            ...p,
                            fechaEntrada: date && date.isValid() ? date : null
                          }))
                        }
                        allowClear={false}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <Label>Origen</Label>
                      <Select
                        value={nuevoProyecto.origen}
                        onValueChange={handleOrigenChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bloque Todos Por Las Flores">Bloque Todos Por Las Flores</SelectItem>
                          <SelectItem value="Bloque Adelante Juntos">Bloque Adelante Juntos</SelectItem>
                          <SelectItem value="Bloque La Libertad Avanza">Bloque La Libertad Avanza</SelectItem>
                          <SelectItem value="Departamento Ejecutivo">Departamento Ejecutivo</SelectItem>
                          <SelectItem value="Comunicaciones oficiales">Comunicaciones oficiales</SelectItem>
                          <SelectItem value="Parlamento Estudiantil">Parlamento Estudiantil</SelectItem>
                          <SelectItem value="Vecinos">Vecinos</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {nuevoProyecto.origen === "otros" && (
                      <div>
                        <Label>Especificar origen</Label>
                        <Input
                          value={nuevoProyecto.origenPersonalizado}
                          onChange={e => setNuevoProyecto(p => ({ ...p, origenPersonalizado: e.target.value }))}
                          placeholder="Ingrese el origen"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Tipo *</Label>
                      <Select
                        value={nuevoProyecto.tipo}
                        onValueChange={(value) => setNuevoProyecto(p => ({ ...p, tipo: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proyecto de Ordenanza">Proyecto de Ordenanza</SelectItem>
                          <SelectItem value="Proyecto de Decreto">Proyecto de Decreto</SelectItem>
                          <SelectItem value="Proyecto de Resolucion">Proyecto de Resolución</SelectItem>
                          <SelectItem value="Proyecto de Comunicacion">Proyecto de Comunicación</SelectItem>
                          <SelectItem value="Nota">Nota</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {nuevoProyecto.tipo === "otro" && (
                      <div>
                        <Label>Especificar tipo</Label>
                        <Input
                          value={nuevoProyecto.tipoPersonalizado}
                          onChange={e => setNuevoProyecto(p => ({ ...p, tipoPersonalizado: e.target.value }))}
                          placeholder="Ingrese el tipo"
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <Label>Título *</Label>
                      <Input
                        value={nuevoProyecto.titulo}
                        onChange={e => setNuevoProyecto(p => ({ ...p, titulo: e.target.value }))}
                        placeholder="Título del proyecto"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descripción (opcional)</Label>
                      <textarea
                        value={nuevoProyecto.descripcion}
                        onChange={e => setNuevoProyecto(p => ({ ...p, descripcion: e.target.value }))}
                        placeholder="Descripción del proyecto"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Adjuntar archivo (PDF)</Label>
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setNuevoProyecto(p => ({ ...p, archivo: e.target.files?.[0] || null }))}
                      />
                      {nuevoProyecto.archivo && (
                        <div className="text-xs text-gray-600 mt-1">Archivo seleccionado: {nuevoProyecto.archivo.name}</div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                                            <Button
                        type="button"
                        onClick={handleAddProyecto}
                        disabled={!nuevoProyecto.numeroExpediente || !nuevoProyecto.fechaEntrada || !nuevoProyecto.titulo || !(nuevoProyecto.origen === "otros" ? nuevoProyecto.origenPersonalizado : nuevoProyecto.origen) || !nuevoProyecto.prefijoOrigen || !(nuevoProyecto.tipo === "otro" ? nuevoProyecto.tipoPersonalizado : nuevoProyecto.tipo)}
                      >
                        Agregar proyecto
                      </Button>
                    </div>
                  </div>
                  {/* Lista de proyectos agregados (antes de guardar) */}
                  {proyectos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Proyectos agregados</h4>
                      <ul className="space-y-2">
                        {proyectos.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-4 bg-gray-50 rounded p-2">
                            <div className="flex-1">
                              <div className="font-medium">{p.prefijoOrigen}-{p.numeroExpediente}</div>
                              <div className="text-sm text-gray-600">Fecha entrada: {p.fechaEntrada ? dayjs(p.fechaEntrada, "YYYY-MM-DD").format("DD-MM-YYYY") : ""}</div>
                              <div className="text-sm text-gray-600">{p.titulo}</div>
                              <div className="text-sm text-gray-600">Origen: {p.origen}</div>
                              <div className="text-sm text-gray-600">Tipo: {p.tipo}</div>
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

            {/* Bloque desplegable de proyectos en sesión (tabla editable) */}
            <div className="border rounded-lg mt-6">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left"
                onClick={() => setShowTablaProyectos(v => !v)}
              >
                <span className="font-semibold text-[#0e4c7d]">Proyectos en sesión</span>
                {showTablaProyectos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showTablaProyectos && (
                <div className="p-4">
                  {editProyectos.length === 0 ? (
                    <div className="text-gray-500">No hay proyectos en sesión.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 border text-center w-[120px]">Fecha de ingreso</th>
                            <th className="px-3 py-2 border text-center w-[120px]">Expte</th>
                            <th className="px-3 py-2 border text-center w-[150px]">Origen</th>
                            <th className="px-3 py-2 border text-center w-[150px]">Tipo</th>
                            <th className="px-3 py-2 border text-center w-2/4">Título</th>
                            <th className="px-3 py-2 border text-center w-[100px]">Archivo</th>
                            <th className="px-2 py-2 border text-center w-[100px]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editProyectos.map((p, idx) => (
                            <tr key={idx} className="align-middle">
                              {/* Fecha de ingreso */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {editingProyecto === idx ? (
                                  <DatePicker
                                    value={p.fechaEntrada && dayjs.isDayjs(p.fechaEntrada) ? p.fechaEntrada : (p.fechaEntrada ? dayjs(p.fechaEntrada, "YYYY-MM-DD") : null)}
                                    format="DD-MM-YYYY"
                                    locale={esES as any}
                                    onChange={(date) => handleEditProyectoChange(idx, "fechaEntrada", date && date.isValid() ? date : null)}
                                    allowClear={false}
                                    style={{ width: '100%' }}
                                  />
                                ) : (
                                  <div className="text-xs font-medium">
                                    {p.fechaEntrada ? dayjs(p.fechaEntrada).format("DD-MM-YYYY") : ""}
                                  </div>
                                )}
                              </td>
                              {/* Expte */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {editingProyecto === idx ? (
                                  <div className="flex gap-1">
                                    <Input
                                      value={p.prefijoOrigen}
                                      onChange={e => handleEditProyectoChange(idx, "prefijoOrigen", e.target.value)}
                                      readOnly={p.origen !== "otros"}
                                      className={`text-xs w-16 ${p.origen !== "otros" ? "bg-gray-100" : ""}`}
                                    />
                                    <Input
                                      value={p.numeroExpediente}
                                      onChange={e => handleEditProyectoChange(idx, "numeroExpediente", e.target.value)}
                                      className="text-xs w-24"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-xs font-medium">{p.prefijoOrigen}-{p.numeroExpediente}</div>
                                )}
                              </td>
                              {/* Origen */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {editingProyecto === idx ? (
                                  <div className="space-y-1">
                                    <Select
                                      value={p.origen}
                                      onValueChange={(value) => handleEditOrigenChange(idx, value)}
                                    >
                                      <SelectTrigger className="text-xs h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Bloque Todos Por Las Flores">Bloque Todos Por Las Flores</SelectItem>
                                        <SelectItem value="Bloque Adelante Juntos">Bloque Adelante Juntos</SelectItem>
                                        <SelectItem value="Bloque La Libertad Avanza">Bloque La Libertad Avanza</SelectItem>
                                        <SelectItem value="Departamento Ejecutivo">Departamento Ejecutivo</SelectItem>
                                        <SelectItem value="Comunicaciones oficiales">Comunicaciones oficiales</SelectItem>
                                        <SelectItem value="Parlamento Estudiantil">Parlamento Estudiantil</SelectItem>
                                        <SelectItem value="Vecinos">Vecinos</SelectItem>
                                        <SelectItem value="otros">Otros</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {p.origen === "otros" && (
                                      <Input
                                        value={editOrigenPersonalizado[idx] || ""}
                                        onChange={e => setEditOrigenPersonalizado(prev => ({ ...prev, [idx]: e.target.value }))}
                                        placeholder="Especificar origen"
                                        className="text-xs h-6"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs font-medium">
                                    {p.origen === "otros" ? (editOrigenPersonalizado[idx] || p.origen) : p.origen}
                                  </div>
                                )}
                              </td>
                              {/* Tipo */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {editingProyecto === idx ? (
                                  <div className="space-y-1">
                                    <Select
                                      value={p.tipo}
                                      onValueChange={(value) => handleEditProyectoChange(idx, "tipo", value)}
                                    >
                                      <SelectTrigger className="text-xs h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Proyecto de Ordenanza">Proyecto de Ordenanza</SelectItem>
                                        <SelectItem value="Proyecto de Decreto">Proyecto de Decreto</SelectItem>
                                        <SelectItem value="Proyecto de Resolucion">Proyecto de Resolución</SelectItem>
                                        <SelectItem value="Proyecto de Comunicacion">Proyecto de Comunicación</SelectItem>
                                        <SelectItem value="Nota">Nota</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {p.tipo === "otro" && (
                                      <Input
                                        value={editTipoPersonalizado[idx] || ""}
                                        onChange={e => setEditTipoPersonalizado(prev => ({ ...prev, [idx]: e.target.value }))}
                                        placeholder="Especificar tipo"
                                        className="text-xs h-6"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs font-medium">
                                    {p.tipo === "otro" ? (editTipoPersonalizado[idx] || p.tipo) : p.tipo}
                                  </div>
                                )}
                              </td>
                              {/* Título */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {editingProyecto === idx ? (
                                  <Input
                                    value={p.titulo}
                                    onChange={e => handleEditProyectoChange(idx, "titulo", e.target.value)}
                                    className="text-xs"
                                  />
                                ) : (
                                  <div className="text-xs font-medium truncate" title={p.titulo}>
                                    {p.titulo}
                                  </div>
                                )}
                              </td>
                              {/* Archivo */}
                              <td className="border px-3 py-2 text-center align-middle">
                                {p.fileUrl ? (
                                  <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
                                    Ver archivo
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-xs">Sin archivo</span>
                                )}
                              </td>
                              {/* Acciones */}
                              <td className="border px-3 py-2 text-center align-middle">
                                <div className="flex gap-1 justify-center">
                                  {editingProyecto === idx ? (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSaveProyecto(idx)}
                                        disabled={savingProyecto === idx}
                                        className="text-xs p-1 h-6 w-6"
                                        title="Guardar"
                                      >
                                        {savingProyecto === idx ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Save className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        className="text-xs p-1 h-6 w-6"
                                        title="Cancelar"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteProyecto(idx)}
                                        disabled={deletingProyecto === idx}
                                        className="text-xs p-1 h-6 w-6 text-red-600 hover:text-red-800"
                                        title="Eliminar"
                                      >
                                        {deletingProyecto === idx ? (
                                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Trash2 className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStartEdit(idx)}
                                        className="text-xs p-1 h-6 w-6"
                                        title="Editar"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteProyecto(idx)}
                                        disabled={deletingProyecto === idx}
                                        className="text-xs p-1 h-6 w-6 text-red-600 hover:text-red-800"
                                        title="Eliminar"
                                      >
                                        {deletingProyecto === idx ? (
                                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Trash2 className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
          </form>
        </CardContent>
      </Card>
    </SessionProviderWrapper>
  )
}