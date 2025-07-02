
import { getAllUsers } from "@/lib/services/user-service"
import Link from "next/link"

export default async function UsuariosPage() {
  const usuarios = await getAllUsers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <Link href="/admin-panel/usuarios/nuevo" className="text-blue-600 hover:underline">
          Agregar usuario
        </Link>
      </div>

      <ul className="divide-y divide-gray-200 border rounded-md">
        {usuarios.map((user) => (
          <li key={user.id} className="p-4">
            <Link
              href={`/admin-panel/usuarios/${user.id}`}
              className="font-medium text-lg text-blue-700 hover:underline"
            >
              {user.name}
            </Link>
            <p className="text-sm text-gray-500">{user.email} — Rol: {user.role}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
