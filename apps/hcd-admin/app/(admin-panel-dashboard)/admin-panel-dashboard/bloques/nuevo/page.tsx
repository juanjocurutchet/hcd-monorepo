import { getActiveCouncilMembersByBlock } from "@/actions/council-actions"
import BloqueForm from "../components/bloque-form"

export default async function NuevoBloquePage() {
  // Traer todos los concejales activos
  const concejales = await getActiveCouncilMembersByBlock()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Bloque Político</h1>
        <p className="text-gray-600">Complete el formulario para agregar un nuevo bloque</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <BloqueForm concejales={concejales.map(c => ({...c, createdAt: new Date(), updatedAt: new Date()}))} />
      </div>
    </div>
  )
}
