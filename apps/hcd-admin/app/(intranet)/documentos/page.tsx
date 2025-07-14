"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const TIPOS = [
  { value: "ordenanza", label: "Ordenanzas" },
  { value: "decreto", label: "Decretos" },
  { value: "resolucion", label: "Resoluciones" },
  { value: "comunicacion", label: "Comunicaciones" },
]

export default function DisposicionesPage() {
  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const router = useRouter()

  useEffect(() => {
    // Traer la cantidad de cada tipo
    Promise.all(
      TIPOS.map(async (tipo) => {
        const res = await fetch(`/api/ordinances?type=${tipo.value}&limit=1`)
        const data = await res.json()
        return { tipo: tipo.value, cantidad: data.pagination?.total || 0 }
      })
    ).then(results => {
      const obj: Record<string, number> = {}
      results.forEach(r => { obj[r.tipo] = r.cantidad })
      setCantidades(obj)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Gestión de Documentos</h1>
        <p className="text-gray-600 text-center">Administra las disposiciones municipales</p>
      </div>

      {/* Acceso rápido a legislación */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscador de Legislación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Accede al buscador completo de ordenanzas, decretos y resoluciones con filtros avanzados.
          </p>
          <Button
            onClick={() => router.push("/legislacion")}
            className="w-full md:w-auto"
          >
            <Search className="w-4 h-4 mr-2" />
            Ir al Buscador de Legislación
          </Button>
        </CardContent>
      </Card>

      {/* Gestión por tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TIPOS.map(tipo => (
          <Card
            key={tipo.value}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (tipo.value === "ordenanza") {
                router.push("/admin-panel/documentos/editar/ordenanza");
              } else {
                router.push(`/admin-panel/documentos/${tipo.value}`);
              }
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{tipo.label}</h2>
                    <p className="text-sm text-gray-500">
                      {cantidades[tipo.value] ?? "-"} {cantidades[tipo.value] === 1 ? "disposición" : "disposiciones"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Gestionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
