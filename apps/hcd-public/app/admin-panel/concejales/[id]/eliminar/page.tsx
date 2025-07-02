import { getCouncilMemberById } from "@/lib/services/session-service"
import { notFound } from "next/navigation"
import EliminarConcejalForm from "../../components/eliminar-concejal-form"

export default async function EliminarConcejalPage({ params }: { params: { id: string } }) {
  const { id } = await params // Asegurarse de esperar `params`
  const numericId = Number(id)
  if (!numericId || isNaN(numericId)) return notFound()

  const concejal = await getCouncilMemberById(numericId)
  if (!concejal) return notFound()

  return (
    <div className="p-6 max-w-xl mx-auto">
      <EliminarConcejalForm concejal={concejal} />
    </div>
  )
}