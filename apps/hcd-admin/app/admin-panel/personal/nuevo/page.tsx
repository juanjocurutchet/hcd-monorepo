import { getAllPoliticalBlocksWithPresident } from "@/actions/council-actions"
import PersonalForm from "../components/personal-form"

export default async function NuevoPersonalPage() {
  const bloques = await getAllPoliticalBlocksWithPresident()
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear nuevo personal</h1>
      <PersonalForm personal={null} bloques={bloques} />
    </div>
  )
}