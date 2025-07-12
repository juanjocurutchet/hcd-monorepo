export const dynamic = "force-dynamic";

import { getAllPoliticalBlocksWithPresident, getCouncilMemberById } from "@/actions/council-actions";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ConcejalForm from "../components/concejal-form";

export default async function EditConcejalPage({ params }: { params: { id: string } }) {
  headers(); // Fuerza request fresh y sin cache
  const { id } = params
  const numericId = Number(id)
  if (!numericId || isNaN(numericId)) return notFound()

  const concejal = await getCouncilMemberById(numericId)
  const bloques = await getAllPoliticalBlocksWithPresident()

  if (!concejal) return notFound()

  // Mapear campos snake_case a camelCase
  const concejalMapped = {
    ...concejal,
    seniorPosition: concejal.seniorPosition || concejal.senior_position || "",
    blockId: concejal.blockId || concejal.block_id || "",
    isActive: concejal.isActive ?? concejal.is_active ?? true,
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar concejal</h1>
      <ConcejalForm key={concejalMapped.id} concejal={concejalMapped} bloques={bloques} />
    </div>
  )
}
