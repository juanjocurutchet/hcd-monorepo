import { getAllPoliticalBlocksWithPresident } from "@/actions/council-actions"
import { notFound } from "next/navigation"
import BloqueForm from "../components/bloque-form"

export default async function EditBloquePage({ params }: { params: { id: string } }) {
  const { id } = params
  const bloques = await getAllPoliticalBlocksWithPresident()
  const bloque = bloques.find((b) => b.id === Number(id))
  if (!bloque) return notFound()

  // Aquí deberías obtener los concejales activos (puedes ajustar según tu lógica)
  const concejales = (bloque as any).members || []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar Bloque</h1>
      <BloqueForm
        bloque={{
          id: bloque.id,
          name: bloque.name,
          color: bloque.color ?? null,
          president: bloque.president ?? null,
        }}
        concejales={concejales}
        miembrosActuales={(bloque as any).members}
      />
    </div>
  )
}
