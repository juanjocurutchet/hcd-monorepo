// app/admin-panel/actividades/page.tsx
import { getAllActivities } from "@/lib/services/activity-service"
import { format } from "date-fns"
import Link from "next/link"

export default async function ActividadesPage() {
  const actividades = await getAllActivities()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Actividades</h1>
        <Link href="/admin-panel/actividades/nueva" className="text-blue-600 hover:underline">
          Agregar actividad
        </Link>
      </div>

      <ul className="space-y-4">
        {actividades.map((actividad) => (
          <li
            key={actividad.id}
            className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            <Link
              href={`/admin-panel/actividades/${actividad.id}`}
              className="flex-1 flex items-center space-x-4 min-w-0"
              prefetch={false}
              style={{ textDecoration: 'none' }}
            >
              <div className="w-2 h-10 rounded bg-orange-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">{actividad.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {format(new Date(actividad.date), "dd/MM/yyyy")} — {actividad.isPublished ? "Publicada" : "No publicada"}
                </p>
              </div>
            </Link>
            <Link
              href={`/admin-panel/actividades/${actividad.id}/eliminar`}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              prefetch={false}
            >
              Eliminar
            </Link>
          </li>
        ))}
      </ul>

      {actividades.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay actividades creadas aún.</p>
          <Link
            href="/admin-panel/actividades/nueva"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera actividad
          </Link>
        </div>
      )}
    </div>
  )
}