import { notFound } from "next/navigation"
import { getSessionById } from "@/lib/services/session-service"
import { SesionForm } from "../components/sesion-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarSesionPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const sesion = await getSessionById(numericId)
  if (!sesion) notFound()

  // ✅ Función para convertir fecha de forma segura
  const formatDate = (date: string | Date) => {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0]
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().split("T")[0]
    }
    return new Date().toISOString().split("T")[0]
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Sesión</h1>
        <p className="text-gray-600">Modifica la información de la sesión</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <SesionForm
          sesion={{
            ...sesion,
            id: String(sesion.id),
            date: sesion.date instanceof Date
            ? sesion.date.toISOString().split("T")[0]
            : new Date(sesion.date).toISOString().split("T")[0],
            videoUrl: sesion.videoUrl ?? undefined,
          }}
        />
      </div>
    </div>
  )
}