import { getPoliticalBlockById } from "@/actions/council-actions"
import { notFound } from "next/navigation"
import EliminarBloqueForm from "../../components/eliminar-bloque-form"

export default async function EliminarBloquePage({ params }: { params: { id: string } }) {
  const { id } = params
  const bloque = await getPoliticalBlockById(Number(id))
  if (!bloque) return notFound()

  return <EliminarBloqueForm bloque={{ ...bloque, memberCount: (bloque as any).members?.length ?? 0 } as any} />
}
