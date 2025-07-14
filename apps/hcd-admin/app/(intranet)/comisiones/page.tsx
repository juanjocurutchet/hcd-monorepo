"use client"
import { useEffect, useState } from "react"
import { ComisionAcordeon } from "./components/comision-acordeon"

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

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Comisiones Internas</h1>
      <p className="mb-8 text-gray-700">
        Las comisiones internas son grupos de trabajo especializados que estudian los proyectos presentados en el
        Concejo Deliberante antes de su tratamiento en el recinto. Cada comisión está integrada por concejales de los
        distintos bloques políticos y se especializa en un área temática específica.
      </p>
      <div className="space-y-6">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Cargando...</div>
        ) : comisiones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay comisiones creadas aún.</div>
        ) : comisiones.map((comision) => (
          <ComisionAcordeon key={comision.id} comision={comision} />
        ))}
      </div>
    </main>
  )
}