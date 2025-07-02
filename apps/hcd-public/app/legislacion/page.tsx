"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronDown, ChevronUp, Download, FileText, Filter, Search } from "lucide-react"
import { useEffect, useState } from "react"

interface Ordinance {
  id: number
  approval_number: number
  title: string
  year: number
  type: string
  category: string
  notes: string | null
  is_active: boolean
  file_url: string | null
  slug: string
  created_at: string
  has_modificatorias: boolean
}

interface Category {
  name: string
  count: number
}

interface Type {
  name: string
  count: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function LegislacionPage() {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Filtros
  const [search, setSearch] = useState("")
  const [searchNumber, setSearchNumber] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [isActive, setIsActive] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Generar años para el filtro (desde 1948 hasta el año actual)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1947 }, (_, i) => currentYear - i)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<string | null>(null)

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [modificatorias, setModificatorias] = useState<Record<string, any[]>>({})
  const [loadingModificatorias, setLoadingModificatorias] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchTypes()
  }, [])

    useEffect(() => {
    // Solo hacer la búsqueda cuando cambian los filtros de categoría, tipo, año o estado
    // La búsqueda por texto se maneja con el botón o Enter
    const hasFilters =
      (selectedCategory && selectedCategory !== "all") ||
      (selectedType && selectedType !== "all") ||
      (selectedYear && selectedYear !== "all") ||
      (isActive && isActive !== "all")

    if (hasFilters || currentPage > 1) {
      fetchOrdinances()
    }
  }, [selectedCategory, selectedType, selectedYear, isActive, currentPage])

  const fetchOrdinances = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })

      if (search) params.append("search", search)
      if (searchNumber) params.append("searchNumber", searchNumber)
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedType && selectedType !== "all") params.append("type", selectedType)
      if (selectedYear && selectedYear !== "all") params.append("year", selectedYear)
      if (isActive && isActive !== "all") params.append("isActive", isActive)

      const response = await fetch(`/api/ordinances?${params}`)
      const data = await response.json()

      setOrdinances(data.data || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching ordinances:", error)
      setOrdinances([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/ordinances/categories")
      const data = await response.json()
      // Verificar que data sea un array antes de establecerlo
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        console.error("Error: categories data is not an array:", data)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/ordinances/types")
      const data = await response.json()
      // Verificar que data sea un array antes de establecerlo
      if (Array.isArray(data)) {
        setTypes(data)
      } else {
        console.error("Error: types data is not an array:", data)
        setTypes([])
      }
    } catch (error) {
      console.error("Error fetching types:", error)
      setTypes([])
    }
  }

  const clearFilters = () => {
    setSearch("")
    setSearchNumber("")
    setSelectedCategory("all")
    setSelectedType("all")
    setSelectedYear("all")
    setIsActive("all")
    setCurrentPage(1)
    setHasSearched(false)
    setOrdinances([])
    setPagination(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  async function handleExpand(ordinance: Ordinance) {
    if (expandedSlug === ordinance.slug) {
      setExpandedSlug(null)
      return
    }
    setExpandedSlug(ordinance.slug)
    if (!modificatorias[ordinance.slug]) {
      setLoadingModificatorias(ordinance.slug)
      try {
        const res = await fetch(`/api/ordinances/${ordinance.slug}`)
        const data = await res.json()
        setModificatorias((prev) => ({ ...prev, [ordinance.slug]: data.modificatorias || [] }))
      } catch (e) {
        setModificatorias((prev) => ({ ...prev, [ordinance.slug]: [] }))
      } finally {
        setLoadingModificatorias(null)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Legislación Municipal
        </h1>
        <p className="text-gray-600">
          Consulta el historial completo de ordenanzas del Concejo Deliberante
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Primera fila: Búsquedas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda por texto */}
            <div>
              <Label htmlFor="search">Buscar por texto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por título o notas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchOrdinances()
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Búsqueda por número */}
            <div>
              <Label htmlFor="searchNumber">Buscar por número</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="searchNumber"
                  placeholder="Ej: 1234, 567..."
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchOrdinances()
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Año */}
            <div>
              <Label htmlFor="year">Año</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los años" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda fila: Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Categoría */}
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Array.isArray(categories) && categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Array.isArray(types) && types.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name} ({type.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Vigentes</SelectItem>
                  <SelectItem value="false">Derogadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botón de búsqueda */}
          <div className="flex justify-center mb-4">
            <Button
              type="button"
              onClick={fetchOrdinances}
              className="px-8"
            >
              Buscar Ordenanzas
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>

            {pagination && (
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} ordenanzas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de ordenanzas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando ordenanzas...</p>
          </div>
        ) : !hasSearched ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Utiliza los filtros de búsqueda para encontrar ordenanzas</p>
              <p className="text-sm text-gray-500">Puedes buscar por texto, número, año, categoría, tipo o estado</p>
            </CardContent>
          </Card>
        ) : !Array.isArray(ordinances) || ordinances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron ordenanzas con los filtros aplicados</p>
            </CardContent>
          </Card>
        ) : (
          ordinances.map((ordinance) => {
            const extension = ordinance.file_url?.split('.').pop()?.toLowerCase();
            let previewType = 'other';
            if (extension === 'pdf') previewType = 'pdf';
            else if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || '')) previewType = 'image';
            else if (["doc", "docx"].includes(extension || '')) previewType = 'doc';
            const isExpanded = expandedSlug === ordinance.slug;
            const mods = modificatorias[ordinance.slug] || [];
            return (
              <Card key={ordinance.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ordenanza N° {ordinance.approval_number}/{ordinance.year}
                        </h3>
                        <Badge variant={ordinance.is_active ? "default" : "secondary"}>
                          {ordinance.is_active ? "Vigente" : "Derogada"}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-3">{ordinance.title}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{ordinance.category}</Badge>
                        <Badge variant="outline">{ordinance.type}</Badge>
                      </div>

                      {ordinance.notes && (
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Notas:</strong> {ordinance.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(ordinance.created_at)}
                        </span>
                      </div>

                      {/* Botón para expandir modificatorias */}
                      {ordinance.has_modificatorias && (
                        <div className="mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleExpand(ordinance)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? "Ocultar modificatorias" : "Ver modificatorias"}
                          </Button>
                        </div>
                      )}

                      {/* Expansión de modificatorias */}
                      {isExpanded && (
                        <div className="mt-4 border-t pt-4">
                          {loadingModificatorias === ordinance.slug ? (
                            <div className="text-gray-500 text-sm">Cargando modificatorias...</div>
                          ) : mods.length === 0 ? (
                            <div className="text-gray-500 text-sm">No hay modificatorias registradas para esta ordenanza.</div>
                          ) : (
                            <div className="space-y-3">
                              {mods.map((mod) => {
                                const modExt = mod.file_url?.split('.').pop()?.toLowerCase();
                                let modPreviewType = 'other';
                                if (modExt === 'pdf') modPreviewType = 'pdf';
                                else if (["jpg", "jpeg", "png", "gif", "webp"].includes(modExt || '')) modPreviewType = 'image';
                                else if (["doc", "docx"].includes(modExt || '')) modPreviewType = 'doc';
                                return (
                                  <Card key={mod.id} className="bg-gray-50 border border-gray-200">
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold">Modificatoria N° {mod.approval_number}/{mod.year}</span>
                                          <Badge variant={mod.is_active ? "default" : "secondary"}>
                                            {mod.is_active ? "Vigente" : "Derogada"}
                                          </Badge>
                                        </div>
                                        <div className="text-gray-700 text-sm mb-1">{mod.title}</div>
                                        <div className="flex flex-wrap gap-2 mb-1">
                                          <Badge variant="outline">{mod.category}</Badge>
                                          <Badge variant="outline">{mod.type}</Badge>
                                        </div>
                                        {mod.notes && (
                                          <div className="text-xs text-gray-600 mb-1"><strong>Notas:</strong> {mod.notes}</div>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 items-end mt-2 md:mt-0">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => { setPreviewUrl(mod.file_url); setPreviewType(modPreviewType); }}>
                                              <FileText className="w-4 h-4 mr-2" />
                                              Previsualizar
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl w-full">
                                            <DialogHeader>
                                              <DialogTitle>Previsualización de archivo</DialogTitle>
                                            </DialogHeader>
                                            {modPreviewType === 'pdf' && previewUrl && (
                                              <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />
                                            )}
                                            {modPreviewType === 'image' && previewUrl && (
                                              <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />
                                            )}
                                            {modPreviewType === 'doc' && previewUrl && (
                                              <iframe
                                                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                                                style={{ width: '100%', height: 600 }}
                                                frameBorder="0"
                                                title="Vista previa DOC"
                                              />
                                            )}
                                            {modPreviewType === 'other' && previewUrl && (
                                              <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>
                                            )}
                                          </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="sm" asChild>
                                          <a href={mod.file_url} download target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 mr-2" />
                                            Descargar
                                          </a>
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {ordinance.file_url && (
                      <div className="flex flex-col gap-2 items-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => { setPreviewUrl(ordinance.file_url); setPreviewType(previewType); }}>
                              <FileText className="w-4 h-4 mr-2" />
                              Previsualizar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl w-full">
                            <DialogHeader>
                              <DialogTitle>Previsualización de archivo</DialogTitle>
                            </DialogHeader>
                            {previewType === 'pdf' && previewUrl && (
                              <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />
                            )}
                            {previewType === 'image' && previewUrl && (
                              <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 500 }} />
                            )}
                            {previewType === 'doc' && previewUrl && (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                                style={{ width: '100%', height: 600 }}
                                frameBorder="0"
                                title="Vista previa DOC"
                              />
                            )}
                            {previewType === 'other' && previewUrl && (
                              <div className="text-gray-600">No se puede previsualizar este tipo de archivo. Puedes descargarlo.</div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" asChild>
                          <a href={ordinance.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            <span className="flex items-center px-4 text-sm">
              Página {currentPage} de {pagination.pages}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
