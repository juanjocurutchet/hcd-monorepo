"use client"

import { Button } from "@/components/ui/button"
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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Disposiciones</h1>
      <div className="space-y-6">
        {TIPOS.map(tipo => (
          <div
            key={tipo.value}
            className="bg-white rounded shadow border border-gray-200 p-8 cursor-pointer hover:bg-blue-50 transition group flex items-center justify-between min-h-[120px]"
            onClick={() => {
              if (tipo.value === "ordenanza") {
                router.push("/admin-panel/documentos/editar/ordenanza");
              } else {
                router.push(`/admin-panel/documentos/${tipo.value}`);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 rounded bg-blue-400 group-hover:bg-blue-600 transition" />
              <div>
                <h2 className="text-xl font-semibold">{tipo.label}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {cantidades[tipo.value] ?? "-"} {cantidades[tipo.value] === 1 ? "disposición" : "disposiciones"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/admin-panel/documentos/nuevo?tipo=${tipo.value}`);
                }}
                className="ml-4"
              >
                Crear
              </Button>
              {tipo.value === "ordenanza" && (
                <Button
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/admin-panel/documentos/editar/ordenanza`);
                  }}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
