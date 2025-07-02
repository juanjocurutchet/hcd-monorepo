import { getStaffById } from "@/lib/services/staff-service"
import { notFound } from "next/navigation"
import EliminarPersonalForm from "../../components/eliminar-personal-form"

export default async function EliminarPersonalPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const numericId = Number(id)
  if (!numericId || isNaN(numericId)) return notFound()
  const personal = await getStaffById(numericId)
  if (!personal) return notFound()
  return (
    <div className="p-6 max-w-xl mx-auto">
      <EliminarPersonalForm personal={personal} />
    </div>
  )
}