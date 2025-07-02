import { getAllPoliticalBlocksWithPresident } from "@/actions/council-actions"
import { notFound } from "next/navigation"
import EliminarBloqueForm from "../../components/eliminar-bloque-form"


interface Props {
  params: Promise<{ id: string }>
}

export default async function EliminarBloquePage({ params }: Props) {
  const { id } = await params
  const bloques = await getAllPoliticalBlocksWithPresident()
  const maybeBloque = bloques.find((b) => b.id === Number(id))
  if (!maybeBloque) return notFound()

  return <EliminarBloqueForm bloque={maybeBloque} />
}
