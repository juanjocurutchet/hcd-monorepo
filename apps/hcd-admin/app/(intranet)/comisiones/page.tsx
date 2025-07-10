"use client"
import { useEffect, useState } from "react"

export default function ComisionesPage() {
  const [comisiones, setComisiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchComisiones() {
    setLoading(true)
    try {
      const res = await fetch("/api/committees", { cache: "no-store" })
      const data = await res.json()
      setComisiones(data)
    } catch {
      setComisiones([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComisiones()
  }, [])

  const handleDelete = async (id: number) => {
    await fetch(`/api/committees/${id}`, { method: "DELETE" })
    fetchComisiones()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Comisiones</h1>
        {/* <Link href="/admin-panel/comisiones/nueva" className="text-blue-600 hover:underline">
          Agregar comisión
        </Link> */}
      </div>

      <div className="bg-white border rounded shadow-sm">
        <ul className="space-y-4">
          {loading ? (
            <li className="p-4 text-center text-gray-400">Cargando...</li>
          ) : comisiones.length === 0 ? (
            <li className="text-center py-8 text-gray-500">No hay comisiones creadas aún.</li>
          ) : comisiones.map((comision) => (
            <li
              key={comision.id}
              className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex-1 flex items-center space-x-4 min-w-0">
                <div className="w-2 h-10 rounded bg-blue-400" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold truncate">{comision.name}</p>
                  <p className="text-sm text-gray-500 truncate">{comision.description}</p>
                  {comision.presidentName && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      Presidente: {comision.presidentName}
                    </div>
                  )}
                </div>
              </div>
              {/* Botón de eliminar eliminado */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}