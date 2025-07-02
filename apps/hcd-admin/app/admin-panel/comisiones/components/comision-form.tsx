"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useApiRequest } from "@/hooks/useApiRequest"; // ✅ Importar hook
import { Select as AntdSelect, DatePicker } from 'antd'
import esES from 'antd/es/date-picker/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { AlertCircle, ChevronDown, ChevronUp, Download, Eye, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Comision {
  id?: string;
  name?: string;
  description?: string;
  presidentId?: string | number;
  secretaryId?: string | number; // ✅ Añadir secretario
  isActive?: boolean;
  members?: { id: string | number }[];
}

// Utilidad para formatear fechas a yyyy-MM-dd para el input type="date"
function toDateInputValue(dateString: string | null | undefined) {
  if (!dateString) return "";
  const d = new Date(dateString);
  // Ajuste para zona horaria local
  const off = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() - off);
  return d.toISOString().slice(0, 10);
}

export function ComisionForm({ comision = null }: { comision?: Comision | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [concejales, setConcejales] = useState<{ id: string | number; name: string }[]>([])
  const { apiRequest, isAuthenticated } = useApiRequest() // ✅ Usar hook

  const [formData, setFormData] = useState({
    name: comision?.name || "",
    description: comision?.description || "",
    presidentId: comision?.presidentId?.toString() || "none",
    secretaryId: comision?.secretaryId?.toString() || "none", // ✅ Añadir secretario
    isActive: comision?.isActive ?? true,
  })

  const [selectedMembers, setSelectedMembers] = useState(
    comision?.members?.map((m) => m.id.toString()) || []
  )

  // Estado para proyectos en comisión
  const [proyectos, setProyectos] = useState<any[]>([])
  const [showProyectos, setShowProyectos] = useState(false)
  const [nuevoProyecto, setNuevoProyecto] = useState({
    expedienteNumber: "",
    fechaEntrada: null as dayjs.Dayjs | null,
    descripcion: "",
    despacho: false,
    fechaDespacho: null as dayjs.Dayjs | null,
    archivo: null as File | null,
  })

  // Estado para edición de proyectos existentes
  const [editProyectos, setEditProyectos] = useState<any[]>([])
  const [showTablaProyectos, setShowTablaProyectos] = useState(false)
  const [savingProyecto, setSavingProyecto] = useState<number | null>(null)
  const [deletingProyecto, setDeletingProyecto] = useState<number | null>(null)

  useEffect(() => {
    const fetchConcejales = async () => {
      try {
        // ✅ Este endpoint puede ser público para listar concejales
        const response = await fetch("/api/council-members")
        if (!response.ok) {
          throw new Error("Error al cargar los concejales")
        }
        const data = await response.json()
        setConcejales(data)
      } catch (err) {
        console.error("Error:", err)
        setError("Error al cargar los concejales")
      }
    }

    fetchConcejales()
  }, [])

  // Cargar proyectos existentes al editar
  useEffect(() => {
    if (comision && comision.id) {
      console.log("Cargando proyectos para comisión:", comision.id)
      fetch(`/api/committees/${comision.id}/files`)
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
              fechaDespacho: p.fechaDespacho ? dayjs(p.fechaDespacho, "YYYY-MM-DD") : null,
            }))
          )
        })
        .catch((error) => {
          console.error("Error al cargar proyectos:", error)
          setEditProyectos([])
        })
    }
  }, [comision?.id])

  useEffect(() => {
    if (comision?.members && concejales.length > 0) {
      setSelectedMembers(comision.members.map((m) => m.id.toString()))
    }
  }, [comision, concejales])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleMemberToggle = (id: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((memberId) => memberId !== id)
      } else {
        return [...prev, id]
      }
    })
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
      if (!formData.name.trim()) {
        throw new Error("El nombre es requerido")
      }

      if (formData.presidentId === formData.secretaryId && formData.presidentId && formData.presidentId !== "none") {
        throw new Error("El presidente y secretario deben ser personas diferentes")
      }

      // Usar FormData para enviar archivos
      const fd = new FormData()
      fd.append("name", formData.name)
      fd.append("description", formData.description)
      fd.append("presidentId", formData.presidentId === "none" ? "" : formData.presidentId)
      fd.append("secretaryId", formData.secretaryId === "none" ? "" : formData.secretaryId)
      fd.append("isActive", String(formData.isActive))
      fd.append("memberIds", JSON.stringify(selectedMembers))

      // Solo enviar proyectos si estamos CREANDO una nueva comisión
      // Si estamos editando, los proyectos se manejan individualmente
      if (!comision) {
        // Serializar proyectos sin el campo archivo (que no es serializable)
        const proyectosToSend = proyectos.map(p => {
          const { archivo, ...rest } = p
          return rest
        })
        fd.append("proyectos", JSON.stringify(proyectosToSend))
        proyectos.forEach((p, idx) => {
          if (p.archivo) {
            fd.append(`archivo_${idx}`, p.archivo)
          }
        })
      } else {
        // En edición, enviar array vacío para que no se eliminen los proyectos existentes
        fd.append("proyectos", JSON.stringify([]))
      }

      const url = comision ? `/api/committees/${comision.id}` : "/api/committees/create"
      const method = comision ? "PUT" : "POST"

      await apiRequest(url, {
        method,
        body: fd,
      })

      router.push("/admin-panel/comisiones")
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

  // Nuevo handleAddProyecto para edición
  const handleAddProyecto = async () => {
    if (!nuevoProyecto.expedienteNumber || !nuevoProyecto.fechaEntrada || !nuevoProyecto.descripcion) return
    if (comision && comision.id) {
      // En edición: enviar a la API
      const fd = new FormData()
      fd.append("expedienteNumber", nuevoProyecto.expedienteNumber)
      fd.append("fechaEntrada", nuevoProyecto.fechaEntrada ? dayjs(nuevoProyecto.fechaEntrada).format("YYYY-MM-DD") : "")
      fd.append("descripcion", nuevoProyecto.descripcion)
      fd.append("despacho", String(nuevoProyecto.despacho))
      if (nuevoProyecto.fechaDespacho)
        fd.append("fechaDespacho", dayjs(nuevoProyecto.fechaDespacho).format("YYYY-MM-DD"))
      if (nuevoProyecto.archivo) fd.append("archivo", nuevoProyecto.archivo)
      const res = await fetch(`/api/committees/${comision.id}/files`, { method: "POST", body: fd })
      if (res.ok) {
        const nuevo = await res.json()
        setEditProyectos(prev => [...prev, nuevo])
        setNuevoProyecto({ expedienteNumber: "", fechaEntrada: null, descripcion: "", despacho: false, fechaDespacho: null, archivo: null })
      }
    } else {
      // En creación: solo local
      setProyectos(prev => [
        ...prev,
        {
          ...nuevoProyecto,
          fechaDespacho: nuevoProyecto.despacho ? nuevoProyecto.fechaDespacho : null,
          archivo: nuevoProyecto.archivo,
        },
      ])
      setNuevoProyecto({ expedienteNumber: "", fechaEntrada: null, descripcion: "", despacho: false, fechaDespacho: null, archivo: null })
    }
  }

  const handleRemoveProyecto = (idx: number) => {
    setProyectos(prev => prev.filter((_, i) => i !== idx))
  }

  // Guardar cambios individuales
  const handleSaveProyecto = async (idx: number) => {
    if (!comision?.id) return

    const proyecto = editProyectos[idx]
    if (!proyecto) return

    setSavingProyecto(idx)
    try {
      const fd = new FormData()
      fd.append("fileId", proyecto.id.toString())
      fd.append("expedienteNumber", proyecto.expedienteNumber)
      fd.append("fechaEntrada", proyecto.fechaEntrada ? dayjs(proyecto.fechaEntrada).format("YYYY-MM-DD") : "")
      fd.append("descripcion", proyecto.descripcion)
      fd.append("despacho", String(proyecto.despacho))
      fd.append("fechaDespacho", proyecto.fechaDespacho ? dayjs(proyecto.fechaDespacho).format("YYYY-MM-DD") : "")

      const res = await fetch(`/api/committees/${comision.id}/files`, {
        method: "PUT",
        body: fd
      })

      if (res.ok) {
        const updated = await res.json()
        setEditProyectos(prev => prev.map((p, i) => i === idx ? updated : p))
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

  const handleDeleteProyecto = async (idx: number) => {
    if (!comision?.id) return

    const proyecto = editProyectos[idx]
    if (!proyecto) return

    // Confirmar eliminación
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      return
    }

    setDeletingProyecto(idx)
    try {
      const fd = new FormData()
      fd.append("fileId", proyecto.id.toString())

      const res = await fetch(`/api/committees/${comision.id}/files`, {
        method: "DELETE",
        body: fd
      })

      if (res.ok) {
        setEditProyectos(prev => prev.filter((_, i) => i !== idx))
        console.log("Proyecto eliminado correctamente")
      } else {
        console.error("Error al eliminar proyecto")
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error)
    } finally {
      setDeletingProyecto(null)
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
    <Card className="w-full">
      <CardContent className="pt-6 px-2 md:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre de la comisión"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción de la comisión"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presidentId">Presidente</Label>
              <Select
                value={formData.presidentId}
                onValueChange={(value: string) => handleSelectChange("presidentId", value)}
              >
                <SelectTrigger id="presidentId">
                  <SelectValue placeholder="Seleccionar presidente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin presidente</SelectItem>
                  {concejales.map((concejal) => (
                    <SelectItem key={concejal.id} value={concejal.id.toString()}>
                      {concejal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Campo para secretario */}
            <div className="space-y-2">
              <Label htmlFor="secretaryId">Secretario</Label>
              <Select
                value={formData.secretaryId}
                onValueChange={(value: string) => handleSelectChange("secretaryId", value)}
              >
                <SelectTrigger id="secretaryId">
                  <SelectValue placeholder="Seleccionar secretario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin secretario</SelectItem>
                  {concejales.map((concejal) => (
                    <SelectItem key={concejal.id} value={concejal.id.toString()}>
                      {concejal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Miembros</Label>
            <AntdSelect
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Agregar miembros"
              value={selectedMembers}
              onChange={(values) => setSelectedMembers(values)}
              optionLabelProp="label"
              options={concejales.map((concejal) => ({
                value: concejal.id.toString(),
                label: concejal.name,
              }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: any) => setFormData({ ...formData, isActive: !!checked })}
            />
            <Label htmlFor="isActive">Activa</Label>
          </div>

          {/* Bloque desplegable para agregar proyectos */}
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
                {/* Formulario para agregar proyecto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label>Expte N°</Label>
                    <Input
                      value={nuevoProyecto.expedienteNumber}
                      onChange={e => setNuevoProyecto(p => ({ ...p, expedienteNumber: e.target.value }))}
                      placeholder="Ej: 1234/2024"
                    />
                  </div>
                  <div>
                    <Label>Fecha de entrada</Label>
                    <DatePicker
                      value={nuevoProyecto.fechaEntrada}
                      format="DD-MM-YYYY"
                      locale={esES}
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
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={nuevoProyecto.descripcion}
                      onChange={e => setNuevoProyecto(p => ({ ...p, descripcion: e.target.value }))}
                      placeholder="Descripción del proyecto en comisión"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Despacho</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={nuevoProyecto.despacho}
                        onCheckedChange={v => setNuevoProyecto(p => ({ ...p, despacho: v }))}
                      />
                      <span>{nuevoProyecto.despacho ? "Sí" : "No"}</span>
                    </div>
                  </div>
                  {nuevoProyecto.despacho && (
                    <div>
                      <Label>Fecha de despacho</Label>
                      <DatePicker
                        value={nuevoProyecto.fechaDespacho}
                        format="DD-MM-YYYY"
                        locale={esES}
                        onChange={(date) =>
                          setNuevoProyecto(p => ({
                            ...p,
                            fechaDespacho: date && date.isValid() ? date : null
                          }))
                        }
                        allowClear={false}
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}
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
                    <Button type="button" onClick={handleAddProyecto} disabled={!nuevoProyecto.expedienteNumber || !nuevoProyecto.fechaEntrada || !nuevoProyecto.descripcion}>
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
                            <div className="font-medium">Expte N°: {p.expedienteNumber}</div>
                            <div className="text-sm text-gray-600">Fecha entrada: {p.fechaEntrada ? dayjs(p.fechaEntrada, "YYYY-MM-DD").format("DD-MM-YYYY") : ""}</div>
                            <div className="text-sm text-gray-600">{p.descripcion}</div>
                            <div className="text-sm">Despacho: {p.despacho ? `Sí${p.fechaDespacho ? ` (${p.fechaDespacho})` : ""}` : "No"}</div>
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

          {/* Bloque desplegable de proyectos en comisión (tabla editable) */}
          <div className="border rounded-lg mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left"
              onClick={() => setShowTablaProyectos(v => !v)}
            >
              <span className="font-semibold text-[#0e4c7d]">Proyectos en comisión</span>
              {showTablaProyectos ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showTablaProyectos && (
              <div className="p-4">
                {editProyectos.length === 0 ? (
                  <div className="text-gray-500">No hay proyectos en comisión.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 border text-center w-[50px]">Expte N°</th>
                          <th className="px-3 py-2 border text-center w-[120px]">Fecha entrada</th>
                          <th className="px-3 py-2 border text-center w-2/4">Descripción</th>
                          <th className="px-2 py-2 border text-center w-[50px]">Despacho</th>
                          <th className="px-3 py-2 border text-center w-[120px]">Fecha despacho</th>
                          <th className="px-2 py-2 border text-center w-[50px]">Archivo</th>
                          <th className="px-2 py-2 border text-center w-[50px]">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editProyectos.map((p, idx) => (
                          <tr key={idx} className="align-middle">
                            <td className="border px-3 py-2 text-center align-middle">{p.expedienteNumber}</td>
                            <td className="border px-3 py-2 text-center align-middle">
                              <DatePicker
                                value={p.fechaEntrada && dayjs.isDayjs(p.fechaEntrada) ? p.fechaEntrada : (p.fechaEntrada ? dayjs(p.fechaEntrada, "YYYY-MM-DD") : null)}
                                format="DD-MM-YYYY"
                                locale={esES}
                                onChange={(date) =>
                                  handleEditProyectoChange(idx, "fechaEntrada", date && date.isValid() ? date : null)
                                }
                                allowClear={false}
                                style={{ width: '100%' }}
                              />
                            </td>
                            <td className="border px-3 py-2 text-center align-middle">{p.descripcion}</td>
                            <td className="border px-3 py-2 text-center align-middle">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={!!p.despacho}
                                  onCheckedChange={v => handleEditProyectoChange(idx, "despacho", v)}
                                />
                              </div>
                            </td>
                            <td className="border px-3 py-2 text-center align-middle">
                              <DatePicker
                                value={p.fechaDespacho && dayjs.isDayjs(p.fechaDespacho) ? p.fechaDespacho : (p.fechaDespacho ? dayjs(p.fechaDespacho, "YYYY-MM-DD") : null)}
                                format="DD-MM-YYYY"
                                locale={esES}
                                onChange={(date) =>
                                  handleEditProyectoChange(idx, "fechaDespacho", date && date.isValid() ? date : null)
                                }
                                allowClear={false}
                                style={{ width: '100%' }}
                                disabled={!p.despacho}
                              />
                            </td>
                            <td className="border px-3 py-2 text-center align-middle">
                              {p.fileUrl ? (
                                <div className="flex items-center justify-center gap-2">
                                  <a
                                    href={p.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                                    title="Ver archivo"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </a>
                                  <a
                                    href={p.fileUrl}
                                    download
                                    className="text-green-600 hover:text-green-800 flex items-center justify-center"
                                    title="Descargar archivo"
                                  >
                                    <Download className="w-5 h-5" />
                                  </a>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="border px-3 py-2 text-center align-middle">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveProyecto(idx)}
                                  disabled={savingProyecto === idx}
                                  className={`${savingProyecto === idx ? 'text-gray-400 cursor-not-allowed border-0' : 'text-blue-600 hover:text-blue-800 border-0'}`}
                                  title="Guardar"
                                  style={{ border: 0 }}
                                >
                                  {savingProyecto === idx ? (
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Save className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProyecto(idx)}
                                  disabled={deletingProyecto === idx}
                                  className={`${deletingProyecto === idx ? 'text-gray-400 cursor-not-allowed border-0' : 'text-red-600 hover:text-red-800 border-0'}`}
                                  title="Eliminar"
                                  style={{ border: 0 }}
                                >
                                  {deletingProyecto === idx ? (
                                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-5 h-5" />
                                  )}
                                </button>
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
              {isSubmitting ? "Guardando..." : comision ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}