import { getCouncilMembersByBlock } from "@/actions/council-actions"
import { getAllCouncilMembers, getAllPoliticalBlocks } from "@/lib/services/session-service"
import { notFound } from "next/navigation"
import BloqueForm from "../components/bloque-form"

export default async function EditBloquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (isNaN(numericId)) return notFound()

  const bloques = await getAllPoliticalBlocks()
  const concejales = await getAllCouncilMembers()
  const miembrosActuales = await getCouncilMembersByBlock(numericId)

  const bloqueBase = bloques.find((b) => b.id === numericId)
  if (!bloqueBase) return notFound()

  const bloqueConPresidente = {
    id: bloqueBase.id,
    name: bloqueBase.name,
    color: bloqueBase.color,
    president: bloqueBase.president,
    presidentId: bloqueBase.president?.id ?? null,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar Bloque</h1>
      <BloqueForm
        bloque={bloqueConPresidente}
        concejales={concejales}
        miembrosActuales={miembrosActuales}
      />
    </div>
  )
}
