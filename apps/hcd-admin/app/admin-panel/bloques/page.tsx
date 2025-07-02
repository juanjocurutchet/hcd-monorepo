// app/admin-panel/bloques/page.tsx

import { getAllPoliticalBlocksWithPresident } from "@/actions/council-actions"
import Image from "next/image"
import Link from "next/link"

export default async function BloquesListPage() {
  const bloques = await getAllPoliticalBlocksWithPresident()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bloques</h1>
        <Link
          href="/admin-panel/bloques/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crear nuevo bloque
        </Link>
      </div>

      <ul className="space-y-4">
        {bloques.map((bloque) => (
          <li
            key={bloque.id}
            className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            <Link
              href={`/admin-panel/bloques/${bloque.id}`}
              className="flex-1 flex items-center space-x-4 min-w-0"
              prefetch={false}
              style={{ textDecoration: 'none' }}
            >
              <div className="w-2 h-10 rounded" style={{ backgroundColor: bloque.color || '#ccc' }} />
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">{bloque.name}</p>
                <p className="text-sm text-gray-500 truncate">Miembros activos: {bloque.memberCount}</p>
                {bloque.president ? (
                  <div className="flex items-center space-x-2 mt-1">
                    {bloque.president.imageUrl && (
                      <Image
                        src={bloque.president.imageUrl}
                        alt={bloque.president.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-700">{bloque.president.name}</p>
                      <p className="text-xs text-gray-500">{bloque.president.position}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">Sin presidente asignado</p>
                )}
              </div>
            </Link>
            <div className="flex space-x-2 ml-4">
              <Link
                href={`/admin-panel/bloques/${bloque.id}/eliminar`}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Eliminar
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
