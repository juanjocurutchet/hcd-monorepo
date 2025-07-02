import { notFound } from "next/navigation"
import { getSessionById } from "@/lib/services/session-service"
import EliminarSesionForm from "../../components/eliminar-sesion-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EliminarSesionPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const sesion = await getSessionById(numericId)
  if (!sesion) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarSesionForm
        sesion={{
          id: sesion.id,
          type: sesion.type,
          date: sesion.date 
        }}
      />
    </div>
  )
}