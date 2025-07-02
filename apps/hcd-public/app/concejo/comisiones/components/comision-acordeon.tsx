'use client'

import { Eye } from "lucide-react"
import { useEffect, useState } from "react"

interface Comision {
  id: number
  name: string
  description: string
  presidentName?: string
}

interface Miembro {
  id: number
  name: string
}

interface Proyecto {
  id: number
  expedienteNumber: string
  fechaEntrada: string
  descripcion: string
  despacho: boolean
  fileUrl?: string
}

export function ComisionAcordeon({ comision }: { comision: Comision }) {
  const [open, setOpen] = useState(false)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(false)

  // Generar color único para cada comisión basado en su ID
  const colors = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
  ]
  const color = colors[comision.id % colors.length]

  useEffect(() => {
    if (open) {
      setLoading(true)
      // Fetch miembros y proyectos solo al expandir
      Promise.all([
        fetch(`/api/committees/${comision.id}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
          })
          .catch(error => {
            console.error('Error fetching comisión:', error)
            return { members: [] }
          }),
        fetch(`/api/committees/${comision.id}/files`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
          })
          .catch(error => {
            console.error('Error fetching proyectos:', error)
            return []
          })
      ])
        .then(([comisionData, proyectosData]) => {
          setMiembros(comisionData.members || [])
          setProyectos((proyectosData || []).filter((p: Proyecto) => !p.despacho))
        })
        .catch(error => {
          console.error('Error cargando datos:', error)
          setMiembros([])
          setProyectos([])
        })
        .finally(() => setLoading(false))
    }
  }, [open, comision.id])

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <button
        className="w-full text-left p-6 flex items-center justify-between bg-white hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div className="flex items-center space-x-4 min-w-0">
          <div className="w-2 h-10 rounded" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#0e4c7d] mb-1">{comision.name}</h2>
            <p className="text-gray-700 mb-1">{comision.description}</p>
            {comision.presidentName && (
              <div className="text-xs text-gray-400">Presidente: {comision.presidentName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
          </span>
          <span className="ml-4 text-2xl">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="bg-gray-50 border-t px-6 py-4">
          {loading ? (
            <div className="text-gray-500">Cargando...</div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-semibold text-[#0a3d68] mb-2">Miembros</h3>
                {miembros.length === 0 ? (
                  <div className="text-gray-400 text-sm">No hay miembros asignados</div>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {miembros.map((m) => (
                      <li key={m.id} className="bg-white border rounded-full px-3 py-1 text-sm shadow">
                        {m.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-[#0a3d68] mb-2">Proyectos en comisión</h3>
                {proyectos.length === 0 ? (
                  <div className="text-gray-400 text-sm">No hay proyectos en comisión</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border text-center">Expte N°</th>
                          <th className="px-3 py-2 border text-center">Fecha de Entrada</th>
                          <th className="px-3 py-2 border text-center">Descripción</th>
                          <th className="px-3 py-2 border text-center">Archivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proyectos.map((p) => (
                          <tr key={p.id}>
                            <td className="border px-3 py-2 text-center">{p.expedienteNumber}</td>
                            <td className="border px-3 py-2 text-center">
                              {p.fechaEntrada ? new Date(p.fechaEntrada).toLocaleDateString('es-ES') : ""}
                            </td>
                            <td className="border px-3 py-2">{p.descripcion}</td>
                            <td className="border px-3 py-2 text-center">
                              {p.fileUrl ? (
                                <a
                                  href={p.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Ver archivo"
                                >
                                  <Eye className="w-5 h-5 inline" />
                                </a>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}