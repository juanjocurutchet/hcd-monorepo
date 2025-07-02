import { getSessions } from "@/lib/services/session-service"
import { formatDate } from "@/lib/utils/format"
import Link from "next/link"

export default async function SesionesPage() {
  // ✅ Mostrar TODAS las sesiones en el admin (publicadas y no publicadas)
  const sesiones = await getSessions({ onlyPublished: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sesiones</h1>
        <Link href="/admin-panel/sesiones/nueva" className="text-blue-600 hover:underline">
          Agregar sesión
        </Link>
      </div>

      <ul className="space-y-4">
        {sesiones.map((sesion) => (
          <li
            key={sesion.id}
            className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            <Link
              href={`/admin-panel/sesiones/${sesion.id}`}
              className="flex-1 flex items-center space-x-4 min-w-0"
              prefetch={false}
              style={{ textDecoration: 'none' }}
            >
              <div className="w-2 h-10 rounded bg-green-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">
                  {formatDate(sesion.date)} — {sesion.type}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {sesion.isPublished ? "Publicada" : "No publicada"}
                </p>
              </div>
            </Link>
            <Link
              href={`/admin-panel/sesiones/${sesion.id}/eliminar`}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              prefetch={false}
            >
              Eliminar
            </Link>
          </li>
        ))}
      </ul>

      {sesiones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay sesiones creadas aún.</p>
          <Link
            href="/admin-panel/sesiones/nueva"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera sesión
          </Link>
        </div>
      )}
    </div>
  )
}