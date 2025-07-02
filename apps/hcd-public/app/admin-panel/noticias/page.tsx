// app/admin-panel/noticias/page.tsx
import { getAllNews } from "@/lib/services/news-service"
import { format } from "date-fns"
import Link from "next/link"

export default async function NoticiasPage() {
  const noticias = await getAllNews()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <Link href="/admin-panel/noticias/nueva" className="text-blue-600 hover:underline">
          Crear nueva noticia
        </Link>
      </div>

      <ul className="space-y-4">
        {noticias.map((noticia) => (
          <li
            key={noticia.id}
            className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            <Link
              href={`/admin-panel/noticias/${noticia.id}`}
              className="flex-1 flex items-center space-x-4 min-w-0"
              prefetch={false}
              style={{ textDecoration: 'none' }}
            >
              <div className="w-2 h-10 rounded bg-red-400" />
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">{noticia.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  {noticia.excerpt || "Sin resumen"} — {noticia.isPublished ? "Publicada" : "No publicada"} el {format(new Date(noticia.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
            </Link>
            <Link
              href={`/admin-panel/noticias/${noticia.id}/eliminar`}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              prefetch={false}
            >
              Eliminar
            </Link>
          </li>
        ))}
      </ul>

      {noticias.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay noticias creadas aún.</p>
          <Link
            href="/admin-panel/noticias/nueva"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear la primera noticia
          </Link>
        </div>
      )}
    </div>
  )
}