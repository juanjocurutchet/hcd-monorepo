// app/admin-panel/concejales/nuevo/page.tsx
import { getAllPoliticalBlocksWithPresident, PoliticalBlockWithPresident } from "@/actions/council-actions"
import ConcejalForm from "../components/concejal-form"

export default async function NuevoConcejalPage() {
  const bloques: PoliticalBlockWithPresident[] = await getAllPoliticalBlocksWithPresident()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear nuevo concejal</h1>
      <ConcejalForm concejal={null} bloques={bloques} />
    </div>
  )
}
