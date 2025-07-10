"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const ROLES = [
  { value: "SUPERADMIN", label: "Superadmin" },
  { value: "ADMIN", label: "Administrador" },
  { value: "EDITOR", label: "Editor" },
  { value: "USER", label: "Usuario" },
  { value: "BLOQUE", label: "Bloque" },
]

export default function UsuariosTableClient() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterName, setFilterName] = useState("")
  const [filterEmail, setFilterEmail] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const router = useRouter()

  async function fetchUsuarios() {
    setLoading(true)
    try {
      const res = await fetch("/api/users", { cache: "no-store" })
      const data = await res.json()
      setUsuarios(data)
    } catch {
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleDelete = async (userId: number) => {
    setShowDeleteModal(false)
    await fetch(`/api/users/${userId}`, { method: "DELETE" })
    fetchUsuarios()
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const filtered = usuarios.filter(u => {
    const matchesName = !filterName || u.name.toLowerCase().includes(filterName.toLowerCase())
    const matchesEmail = !filterEmail || u.email.toLowerCase().includes(filterEmail.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    return matchesName && matchesEmail && matchesRole
  })

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={filterEmail}
            onChange={e => setFilterEmail(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded w-full"
          >
            <option value="">Todos los roles</option>
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 flex items-center">{filtered.length} de {usuarios.length} usuarios</span>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">No hay usuarios</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ROLES.find(r => r.value === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {/* Botones de editar y eliminar eliminados */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal de confirmación para eliminar */}
      {/* Modal de confirmación para editar */}
    </>
  )
}