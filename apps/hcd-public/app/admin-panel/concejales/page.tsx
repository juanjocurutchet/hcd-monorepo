import { getAllCouncilMembers } from "@/lib/services/session-service"
import Link from "next/link"
import { ConcejalFicha } from "./components/ConcejalFicha"

export default async function ConcejalesPage() {
  const concejales = await getAllCouncilMembers()

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
        <Link href="/admin-panel/concejales/nuevo" className="text-blue-600 hover:underline">
          Agregar concejal
        </Link>
      </div>

      <div className="space-y-6">
        {Object.entries(concejalesPorBloque).map(([bloque, concejalesDelBloque]) => (
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
                    <Link
                      href={`/admin-panel/concejales/${concejal.id}`}
                      className="text-blue-600 hover:underline"
                      prefetch={false}
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin-panel/concejales/${concejal.id}/eliminar`}
                      className="text-red-600 hover:underline"
                      prefetch={false}
                    >
                      Eliminar
                    </Link>
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