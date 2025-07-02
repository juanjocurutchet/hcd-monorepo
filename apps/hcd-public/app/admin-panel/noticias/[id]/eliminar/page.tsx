import { notFound } from "next/navigation"
import { getNewsById } from "@/lib/services/news-service"
import EliminarNoticiaForm from "@/app/admin-panel/noticias/components/eliminar-noticia-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EliminarNoticiaPage({ params }: PageProps) {
  const { id } = await params
const numericId = Number.parseInt(id)

  if (isNaN(numericId)) notFound()

  const noticia = await getNewsById(numericId)
  if (!noticia) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarNoticiaForm noticia={{ id: noticia.id, title: noticia.title }} />
    </div>
  )
}