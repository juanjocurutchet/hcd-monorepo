"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select as AntdSelect } from "antd"
import "dayjs/locale/es"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Documento {
  id?: string;
  title?: string;
  number?: string;
  type?: string;
  content?: string;
  isPublished?: boolean;
  status?: string;
  topics?: string[];
  keywords?: string[];
  summary?: string;
  observations?: string;
  authors?: string[];
  block?: string;
  internalNotes?: string;
  sanctionDate?: string;
  publicationDate?: string;
}

const TIPO_DISPOSICION_OPTIONS = [
  { value: "ordenanza", label: "Ordenanza" },
  { value: "decreto", label: "Decreto" },
  { value: "comunicacion", label: "Comunicación" },
  { value: "resolucion", label: "Resolución" },
];

const ESTADO_OPTIONS = [
  { value: "vigente", label: "Vigente" },
  { value: "derogada", label: "Derogada" },
  { value: "modificadora", label: "Modificadora" },
];

export function DocumentoForm({ documento = null }: { documento?: any | null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    tipo_disposicion: documento?.tipo_disposicion || "ordenanza",
    type: documento?.type || "",
    category: documento?.category || "",
    number: documento?.number || documento?.approval_number?.toString() || "",
    year: documento?.year || "",
    approval_number: documento?.approval_number || "",
    title: documento?.title || "",
    notes: documento?.notes || "",
    is_active: documento?.is_active ?? true,
    estado: documento?.estado || "vigente",
    derogada_por_numero: documento?.derogada_por_numero || "",
    file_url: documento?.file_url || "",
  })
  const [tipos, setTipos] = useState<{ value: string; label: string }[]>([])
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([])
  const [ordenanzas, setOrdenanzas] = useState<{ value: string; label: string }[]>([])
  const [modificadasIds, setModificadasIds] = useState<string[]>([])
  const [derogadasIds, setDerogadasIds] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [removeFile, setRemoveFile] = useState(false)
  const [modificaOptions, setModificaOptions] = useState<{ value: string; label: string }[]>([])
  const [derogaOptions, setDerogaOptions] = useState<{ value: string; label: string }[]>([])
  const [modificaSelected, setModificaSelected] = useState<{ value: string; label: string }[]>([])
  const [derogaSelected, setDerogaSelected] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    fetch("/api/ordinances/types")
      .then(res => res.json())
      .then(data => {
        const tiposData = Array.isArray(data) ? data : data.data;
        setTipos(
          (tiposData || []).map((t: any) => ({
            value: t.name,
            label: t.name.charAt(0).toUpperCase() + t.name.slice(1)
          }))
        );
      });
  }, []);

  useEffect(() => {
    fetch("/api/ordinances/categories")
      .then(res => res.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.data;
        setCategorias(
          (cats || []).map((c: any) => ({
            value: c.name,
            label: c.name.charAt(0).toUpperCase() + c.name.slice(1)
          }))
        );
      });
  }, []);

  useEffect(() => {
    fetch("/api/ordinances/lista-simple")
      .then(res => res.json())
      .then(data => {
        const docs = Array.isArray(data) ? data : data.data
        setOrdenanzas(
          (docs || []).map((o: any) => ({
            value: o.id.toString(),
            label: `${o.approval_number ? `N° ${o.approval_number}` : ''} ${o.title ? `- ${o.title}` : ''} ${o.year ? `(${o.year})` : ''}`.trim()
          }))
        )
      })
  }, [])

  // Cargar las ordenanzas que modifica cuando se edita un documento
  useEffect(() => {
    // Precargar modificadas
    if (documento?.modificaOrdenanzas) {
      const opts = documento.modificaOrdenanzas.map((o: any) => ({ value: o.id.toString(), label: getLabelCorto(o) }))
      setModificaSelected(opts)
      setModificadasIds(opts.map((opt: { value: string; label: string }) => opt.value))
    }
    // Precargar derogadas
    if (documento?.derogaOrdenanzas) {
      const opts = documento.derogaOrdenanzas.map((o: any) => ({ value: o.id.toString(), label: getLabelCorto(o) }))
      setDerogaSelected(opts)
      setDerogadasIds(opts.map((opt: { value: string; label: string }) => opt.value))
    }
  }, [documento])

  // Helpers para obtener el label completo y el label corto
  const getLabelCompleto = (o: any) => o?.approval_number ? `N° ${o.approval_number}${o.title ? ` - ${o.title}` : ''}${o.year ? ` (${o.year})` : ''}` : o?.id?.toString() || "";
  const getLabelCorto = (o: any) => o?.approval_number ? o.approval_number.toString() : o?.id?.toString() || "";

  // Búsqueda remota para modificadas
  const handleSearchModifica = async (value: string) => {
    if (!value) return;
    const res = await fetch(`/api/ordinances/lista-simple?search=${encodeURIComponent(value)}`)
    const data = await res.json()
    setModificaOptions((data || []).map((o: any) => ({ value: o.id.toString(), label: getLabelCompleto(o) })))
  }
  // Búsqueda remota para derogadas
  const handleSearchDeroga = async (value: string) => {
    if (!value) return;
    const res = await fetch(`/api/ordinances/lista-simple?search=${encodeURIComponent(value)}`)
    const data = await res.json()
    setDerogaOptions((data || []).map((o: any) => ({ value: o.id.toString(), label: getLabelCompleto(o) })))
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setFile(files[0])
      setRemoveFile(false)
    }
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      const data = new FormData()
      const approval_number = formData.number;
      data.append("tipo_disposicion", formData.tipo_disposicion)
      data.append("type", formData.type)
      data.append("category", formData.category)
      data.append("number", formData.number)
      data.append("year", formData.year)
      data.append("approval_number", approval_number)
      data.append("title", formData.title)
      data.append("notes", formData.notes)
      data.append("is_active", formData.is_active ? "true" : "false")
      data.append("estado", formData.estado)
      if (formData.estado === "derogada") {
        data.append("derogada_por_numero", formData.derogada_por_numero)
      }
      data.append("modificadasIds", JSON.stringify(modificadasIds))
      data.append("derogadasIds", JSON.stringify(derogadasIds))
      if (file) {
        data.append("file", file)
      }
      if (removeFile) {
        data.append("eliminar_archivo", "true")
      }
      const url = documento ? `/api/ordinances/${documento.id}` : "/api/ordinances"
      const method = documento ? "PUT" : "POST"
      const response = await fetch(url, { method, body: data })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la ordenanza")
      }
      router.push("/admin-panel/documentos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!documento?.id) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/ordinances/${documento.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar la disposición")
      router.push("/admin-panel/documentos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardContent className="pt-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tipo de disposición *</Label>
                <AntdSelect
                  value={formData.tipo_disposicion}
                  onChange={value => setFormData({ ...formData, tipo_disposicion: value })}
                  options={TIPO_DISPOSICION_OPTIONS}
                  style={{ width: "100%" }}
                  placeholder="Seleccionar tipo de disposición"
                />
              </div>
              <div>
                <Label>Número *</Label>
                <Input name="number" value={formData.number} onChange={handleChange} required />
              </div>
              <div>
                <Label>Año *</Label>
                <Input name="year" value={formData.year} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoría *</Label>
                <AntdSelect
                  value={formData.category}
                  onChange={value => setFormData({ ...formData, category: value })}
                  options={categorias}
                  style={{ width: "100%" }}
                  placeholder="Seleccionar categoría"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <AntdSelect
                  value={formData.type}
                  onChange={value => setFormData({ ...formData, type: value })}
                  options={tipos}
                  style={{ width: "100%" }}
                  placeholder="Seleccionar tipo"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estado *</Label>
                <AntdSelect
                  value={formData.estado}
                  onChange={value => setFormData({ ...formData, estado: value })}
                  options={ESTADO_OPTIONS}
                  style={{ width: "100%" }}
                  placeholder="Seleccionar estado"
                />
                {formData.estado === "derogada" && (
                  <div className="mt-2">
                    <Label>N° Ordenanza que la deroga</Label>
                    <Input name="derogada_por_numero" value={formData.derogada_por_numero} onChange={handleChange} />
                  </div>
                )}
              </div>
            </div>
            {formData.tipo_disposicion === "ordenanza" && (
              <div>
                <Label>Modifica ordenanzas N°</Label>
                <AntdSelect
                  mode="multiple"
                  value={modificadasIds}
                  onChange={setModificadasIds}
                  options={[...modificaSelected, ...modificaOptions]}
                  style={{ width: "100%" }}
                  placeholder="Buscar y seleccionar ordenanzas que modifica"
                  showSearch
                  filterOption={false}
                  onSearch={handleSearchModifica}
                  notFoundContent={null}
                  optionLabelProp="label"
                />
              </div>
            )}
            {formData.tipo_disposicion === "ordenanza" && (
              <div>
                <Label>Deroga ordenanzas N°</Label>
                <AntdSelect
                  mode="multiple"
                  value={derogadasIds}
                  onChange={setDerogadasIds}
                  options={[...derogaSelected, ...derogaOptions]}
                  style={{ width: "100%" }}
                  placeholder="Buscar y seleccionar ordenanzas que deroga"
                  showSearch
                  filterOption={false}
                  onSearch={handleSearchDeroga}
                  notFoundContent={null}
                  optionLabelProp="label"
                />
              </div>
            )}
            <div>
              <Label>Notas</Label>
              <Textarea name="notes" value={formData.notes} onChange={handleChange} />
            </div>
            <div>
              <Label>Adjuntar archivo</Label>
              {formData.file_url && !removeFile && (
                <div className="mb-2 flex items-center gap-2">
                  <a href={formData.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo actual</a>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setRemoveFile(true); setFile(null); }}>Eliminar archivo</Button>
                </div>
              )}
              <Input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} />
              {removeFile && (
                <div className="text-sm text-red-600 mt-1">El archivo actual será eliminado.</div>
              )}
            </div>
            <div className="flex gap-4 justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? "Guardando..." : documento ? "Actualizar" : "Crear"}
              </Button>
              {documento && documento.id && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              )}
            </div>
          </form>
          {/* Diálogo de confirmación de borrado */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogTitle>¿Eliminar disposición?</DialogTitle>
              <DialogDescription>
                Esta acción eliminará la disposición de forma permanente. ¿Deseas continuar?
              </DialogDescription>
              <p>¿Estás seguro de que deseas eliminar esta disposición? Esta acción no se puede deshacer.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
