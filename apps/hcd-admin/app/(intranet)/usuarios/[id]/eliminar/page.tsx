import { getUserById } from "@/lib/services/user-service"
import { notFound } from "next/navigation"
import EliminarUsuarioForm from "../../components/eliminar-usuarios-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EliminarUsuarioPage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const usuario = await getUserById(id)
  if (!usuario) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarUsuarioForm usuario={{ id: usuario.id, name: usuario.name }} />
    </div>
  )
}
