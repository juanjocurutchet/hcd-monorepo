"use client"
import { useEffect, useState } from "react"
import { ConcejalFicha } from "./components/ConcejalFicha"

export default function ConcejalesPage() {
  const [concejales, setConcejales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchConcejales() {
    setLoading(true)
    try {
      const res = await fetch("/api/council-members", { cache: "reload" })
      const data = await res.json()
      setConcejales(data)
    } catch {
      setConcejales([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConcejales()
  }, [])

  // Agrupar por bloque
  const concejalesPorBloque = concejales.reduce<Record<string, typeof concejales>>((acc, concejal) => {
    const bloque = concejal.blockName || "Sin bloque asignado"
    if (!acc[bloque]) acc[bloque] = []
    acc[bloque].push(concejal)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Concejales</h1>
        {/* <Link href="/admin-panel/concejales/nuevo" className="text-blue-600 hover:underline">
          Agregar concejal
        </Link> */}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-400">Cargando...</div>
        ) : Object.entries(concejalesPorBloque).map(([bloque, concejalesDelBloque]) => (
          <div key={bloque} className="bg-white border rounded shadow-sm">
            <h2 className="px-4 py-3 font-semibold bg-gray-100 border-b">Bloque: {bloque}</h2>
            <ul>
              {concejalesDelBloque.map((concejal) => (
                <li
                  key={concejal.id}
                  className="flex justify-between items-center px-4 py-3 border-t hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <ConcejalFicha concejal={concejal} />
                  </div>

                  <div className="flex gap-2">
                    {/* Botones de editar y eliminar eliminados */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}