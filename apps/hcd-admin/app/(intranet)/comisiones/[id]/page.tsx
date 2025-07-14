import { getCommissionById } from "@/lib/services/commission-service";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ComisionForm } from "../components/comision-form";

interface PageProps {
  params: Promise<{ id: string }> // ✅ Cambiar a Promise
}

export default async function EditarComisionPage({ params }: PageProps) {
  headers(); // Fuerza request fresh y sin cache
  const { id } = await params // ✅ Await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const comision = await getCommissionById(numericId)
  if (!comision) notFound()

  return (
    <div className="w-full py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Comisión</h1>
        <p className="text-gray-600">Modifica la información de la comisión</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ComisionForm
          comision={{
            ...comision,
            id: String(comision.id),
            description: comision.description ?? undefined,
            presidentId: comision.presidentId ? String(comision.presidentId) : undefined,
            secretaryId: comision.secretaryId ? String(comision.secretaryId) : undefined,
            secretaryHcdId: comision.secretaryHcdId ?? undefined,
            members: Array.isArray(comision.members)
              ? comision.members.map((m: any) => ({
                  id: m.id !== null && m.id !== undefined ? String(m.id) : "",
                  name: m.name ?? ""
                }))
              : [],
          }}
        />
      </div>
    </div>
  )
}