// app/admin-panel/comisiones/page.tsx
import { getAllCommissions } from "@/lib/services/commission-service"
import Link from "next/link"

export default async function ComisionesPage() {
  const comisiones = await getAllCommissions()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Comisiones</h1>
        <Link href="/admin-panel/comisiones/nueva" className="text-blue-600 hover:underline">
          Agregar comisión
        </Link>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <ul className="space-y-4">
          {comisiones.map((comision) => (
            <li
              key={comision.id}
              className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
            >
              <Link
                href={`/admin-panel/comisiones/${comision.id}`}
                className="flex-1 flex items-center space-x-4 min-w-0"
                prefetch={false}
                style={{ textDecoration: 'none' }}
              >
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
              </Link>
              <div className="flex space-x-2 ml-4">
                <Link
                  href={`/admin-panel/comisiones/${comision.id}/eliminar`}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  prefetch={false}
                >
                  Eliminar
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {comisiones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay comisiones creadas aún.</p>
          </div>
        )}
      </div>
    </div>
  )
}