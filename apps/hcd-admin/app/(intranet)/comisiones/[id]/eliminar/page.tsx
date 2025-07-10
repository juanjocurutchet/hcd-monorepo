import { getCommissionById } from "@/lib/services/commission-service"
import { notFound } from "next/navigation"
import EliminarComisionForm from "../../components/eliminar-comision-form"

interface PageProps {
  params: Promise<{ id: string }> // ✅ Cambiar a Promise
}

export default async function EliminarComisionPage({ params }: PageProps) {
  const { id } = await params // ✅ Await params
  const numericId = Number.parseInt(id)
  if (isNaN(numericId)) notFound()

  const comision = await getCommissionById(numericId)
  if (!comision) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarComisionForm comision={{ id: comision.id, name: comision.name }} />
    </div>
  )
}