"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select as AntdSelect } from "antd"
import { useEffect, useRef, useState } from "react"
import { DocumentoForm } from "../../components/documento-form"

export default function EditarOrdenanzaPage() {
  const [search, setSearch] = useState("")
  const [options, setOptions] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const selectRef = useRef<any>(null)

  // Buscar ordenanzas al hacer click en Buscar o al escribir
  const handleSearch = () => {
    setLoading(true)
    fetch(`/api/ordinances/lista-simple?search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        setOptions(
          (data || []).map((o: any) => ({
            value: o.id.toString(),
            label: `N° ${o.approval_number} - ${o.title} (${o.year})`
          }))
        )
        setSelectOpen(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (search.length > 0) {
      handleSearch()
    } else {
      setOptions([])
      setSelectOpen(false)
    }
    // eslint-disable-next-line
  }, [search])

  useEffect(() => {
    if (selectedId) {
      setLoading(true)
      fetch(`/api/ordinances/${selectedId}`)
        .then(res => res.json())
        .then(data => setSelectedDoc(data))
        .finally(() => setLoading(false))
    } else {
      setSelectedDoc(null)
    }
  }, [selectedId])

  const handleClear = () => {
    setSelectedId(null)
    setSelectedDoc(null)
    setSearch("")
    setOptions([])
    setSelectOpen(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Editar Ordenanza</h1>
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder="Buscar por número o título..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-1/2"
              onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
              disabled={!!selectedId}
            />
            <Button onClick={handleSearch} disabled={!!selectedId || loading} type="button">
              Buscar
            </Button>
            <AntdSelect
              ref={selectRef}
              showSearch
              open={selectOpen && !selectedId}
              value={selectedId}
              onChange={setSelectedId}
              options={options}
              placeholder="Seleccionar ordenanza"
              style={{ width: "100%", maxWidth: 400 }}
              loading={loading}
              filterOption={false}
              notFoundContent={loading ? "Cargando..." : "No hay resultados"}
              onOpenChange={open => setSelectOpen(open)}
              disabled={!!selectedId}
            />
            {selectedId && (
              <Button variant="outline" onClick={handleClear} type="button">
                Limpiar selección
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedDoc && (
        <DocumentoForm documento={selectedDoc} />
      )}
    </div>
  )
}