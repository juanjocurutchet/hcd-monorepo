import { getAllPoliticalBlocksWithPresident, getCouncilMemberById } from "@/actions/council-actions"
import { notFound } from "next/navigation"
import ConcejalForm from "../components/concejal-form"

export default async function EditConcejalPage({ params }: { params: { id: string } }) {
  const { id } = await params // Asegurarse de esperar `params`
  const numericId = Number(id)
  if (!numericId || isNaN(numericId)) return notFound()

  const concejal = await getCouncilMemberById(numericId)
  const bloques = await getAllPoliticalBlocksWithPresident()

  if (!concejal) return notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar concejal</h1>
      <ConcejalForm concejal={concejal} bloques={bloques} />
    </div>
  )
}
