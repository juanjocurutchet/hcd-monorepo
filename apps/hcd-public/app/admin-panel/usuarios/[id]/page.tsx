import { notFound } from "next/navigation"

import { UsuarioForm } from "../components/usuario-form"
import { getUserById } from "@/lib/services/user-service"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditarUsuarioPage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const usuario = await getUserById(id)
  if (!usuario) notFound()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-600">Modifica la información del usuario</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <UsuarioForm
          usuario={{
            ...usuario,
            id: String(usuario.id),
          }}
        />
      </div>
    </div>
  )
}
