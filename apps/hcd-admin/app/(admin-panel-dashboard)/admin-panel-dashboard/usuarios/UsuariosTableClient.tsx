"use client"
import { usePathname, useRouter } from "next/navigation"
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
  const pathname = usePathname()

  async function fetchUsuarios() {
    setLoading(true)
    console.log("[UsuariosTableClient] Iniciando fetchUsuarios...")
    try {
      const res = await fetch("/api/users", {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await res.json()
      console.log("[UsuariosTableClient] Datos recibidos:", data)
      // Ahora data es un array de usuarios directamente
      const usuariosArray = Array.isArray(data) ? data : [];
      setUsuarios(usuariosArray)
    } catch (error) {
      console.error("[UsuariosTableClient] Error al fetch:", error)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Actualizar cuando se regrese a la página de usuarios
  useEffect(() => {
    if (pathname === "/admin-panel-dashboard/usuarios") {
      fetchUsuarios()
    }
  }, [pathname])

  // Forzar actualización cuando se regrese a la página
  useEffect(() => {
    const handleFocus = () => {
      if (pathname === "/admin-panel-dashboard/usuarios") {
        fetchUsuarios()
      }
    }

    const handlePopState = () => {
      if (pathname === "/admin-panel-dashboard/usuarios") {
        fetchUsuarios()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])

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
                    <button
                      onClick={() => { setSelectedUser(user); setShowEditModal(true) }}
                      className="text-blue-600 hover:text-blue-900 text-sm px-4 py-1 border border-blue-200 rounded hover:bg-blue-50 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setShowDeleteModal(true) }}
                      className="text-red-600 hover:text-red-900 text-sm px-4 py-1 border border-red-200 rounded hover:bg-red-50 transition ml-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">¿Eliminar usuario?</h2>
            <p>¿Estás seguro de que deseas eliminar a <b>{selectedUser?.name}</b>?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={() => handleDelete(selectedUser.id)} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación para editar */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">¿Editar usuario?</h2>
            <p>¿Deseas editar a <b>{selectedUser?.name}</b>?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={() => { setShowEditModal(false); router.push(`/admin-panel-dashboard/usuarios/${selectedUser.id}`) }} className="px-4 py-2 bg-blue-600 text-white rounded">Editar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}