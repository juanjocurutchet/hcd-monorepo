"use client"
import { useEffect, useState } from "react"
import BloquesAccordion from "./components/BloquesAccordion"

export default function BloquesListPage() {
  const [bloques, setBloques] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBloques() {
      setLoading(true)
      try {
        const res = await fetch("/api/political-blocks", { cache: "reload" })
        const bloques = await res.json()
        // Para cada bloque, obtener concejales y (opcional) secretario
        const bloquesConConcejales = await Promise.all(
          bloques.map(async (bloque: any) => {
            const concejalesRes = await fetch(`/api/council-members?blockId=${bloque.id}`)
            const concejales = await concejalesRes.json()
            let concejalesOrdenados = concejales
            if (bloque.president && bloque.president.id) {
              concejalesOrdenados = [
                ...concejales.filter((c: any) => c.id === bloque.president.id),
                ...concejales.filter((c: any) => c.id !== bloque.president.id),
              ]
            }
            // Si tienes endpoint de secretario, aquí puedes hacer el fetch
            // let secretario = null
            // const secretarioRes = await fetch(`/api/secretario?blockId=${bloque.id}`)
            // secretario = await secretarioRes.json()
            return { ...bloque, concejales: concejalesOrdenados /*, secretario */ }
          })
        )
        setBloques(bloquesConConcejales)
      } catch {
        setBloques([])
      } finally {
        setLoading(false)
      }
    }
    fetchBloques()
  }, [])

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Bloques Políticos</h1>
      {loading ? (
        <div className="text-center text-gray-400">Cargando...</div>
      ) : (
        <BloquesAccordion bloques={bloques} />
      )}
    </main>
  )
}
