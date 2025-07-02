import { notFound } from "next/navigation"
import { getDocumentById } from "@/lib/services/document-service"
import EliminarDocumentoForm from "../../components/eliminar-documento-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EliminarDocumentoPage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const documento = await getDocumentById(id)
  if (!documento) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarDocumentoForm documento={{ id: documento.id, title: documento.title }} />
    </div>
  )
}
