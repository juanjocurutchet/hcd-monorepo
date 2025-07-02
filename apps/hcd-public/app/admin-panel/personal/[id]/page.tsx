import { getAllPoliticalBlocks } from "@/lib/services/session-service"
import { getStaffById } from "@/lib/services/staff-service"
import { notFound } from "next/navigation"
import PersonalForm from "../components/personal-form"

export default async function EditPersonalPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const numericId = Number(id)
  if (!numericId || isNaN(numericId)) return notFound()
  const personal = await getStaffById(numericId)
  const bloques = await getAllPoliticalBlocks()
  if (!personal) return notFound()
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar personal</h1>
      <PersonalForm personal={personal} bloques={bloques} />
    </div>
  )
}