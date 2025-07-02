// app/admin-panel/actividades/[id]/page.tsx
import { notFound } from "next/navigation"
import { getActivityById } from "@/lib/services/activity-service"
import { ActividadForm } from "../components/actividad-form"

interface PageProps {
  params: Promise<{ id: string }> // ✅ Promise
}

// app/admin-panel/actividades/[id]/page.tsx
export default async function EditarActividadPage({ params }: PageProps) {
  const { id } = await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const actividad = await getActivityById(numericId) as any
  if (!actividad) notFound()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Actividad</h1>
        <p className="text-gray-600">Modifica la información de la actividad</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ActividadForm
          actividad={{
            ...actividad,
            id: String(actividad.id),
            date: actividad.date instanceof Date
              ? actividad.date.toISOString()
              : new Date(actividad.date).toISOString(),
            location: actividad.location ?? "",
            imageUrl: actividad.imageUrl ?? undefined,
          }}
        />
      </div>
    </div>
  )
}