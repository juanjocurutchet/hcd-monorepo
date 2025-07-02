import { notFound } from "next/navigation"
import { getNewsById } from "@/lib/services/news-service"
import { NoticiaForm } from "../components/noticia-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditarNoticiaPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number.parseInt(id)

  if (isNaN(numericId)) {
    notFound()
  }

  const noticia = await getNewsById(numericId)

  if (!noticia) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editar Noticia</h1>
      </div>

      <div className="bg-white rounded-md shadow p-6">
        <NoticiaForm noticia={{ ...noticia, id: String(noticia.id), excerpt: noticia.excerpt ?? undefined }} />
      </div>
    </div>
  )
}
