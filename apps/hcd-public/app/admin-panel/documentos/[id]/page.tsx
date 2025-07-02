import { getDocumentById } from "@/lib/services/document-service"
import { notFound } from "next/navigation"
import { DocumentoForm } from "../components/documento-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditarDocumentoPage(props: PageProps) {
  const params = await props.params;
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const documento = await getDocumentById(id)
  if (!documento) notFound()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Documento</h1>
        <p className="text-gray-600">Modifica la información del documento</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
      <DocumentoForm
        documento={{
          ...documento,
          id: String(documento.id),
          number: documento.number ?? undefined,
          content: documento.content ?? undefined,
        }}
      />
      </div>
    </div>
  )
}
