// app/admin-panel/actividades/[id]/eliminar/page.tsx
import { getActivityById } from "@/lib/services/activity-service"
import { notFound } from "next/navigation"
import EliminarActividadForm from "../../components/eliminar-actividad-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EliminarActividadPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const actividad = await getActivityById(numericId)
  if (!actividad) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarActividadForm actividad={{ id: actividad.id, title: actividad.title }} />
    </div>
  )
}