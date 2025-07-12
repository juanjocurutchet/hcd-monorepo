"use client"

import { useEffect, useState } from "react"

interface Contact {
  id: number
  name: string
  email: string
  role: string
}

interface Group {
  id: number
  name: string
  description: string
  memberCount: number
}

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showMembers, setShowMembers] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<{[key: number]: any[]}>({})

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddMemberModal, setShowAddMemberModal] = useState<number | null>(null)
  const [addMemberSearch, setAddMemberSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [groupsRes, contactsRes] = await Promise.all([
        fetch("/api/contact-groups"),
        fetch("/api/contacts")
      ])
      const groupsData = await groupsRes.json()
      const contactsData = await contactsRes.json()
      setGroups(groupsData)
      setContacts(contactsData)
    } catch {
      setError("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/contact-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al crear grupo")
      } else {
        setForm({ name: "", description: "" })
        fetchData()
      }
    } catch {
      setError("Error al crear grupo")
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = async (groupId: number, contactId: number) => {
    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      })
      if (res.ok) {
        fetchData()
        await loadGroupMembers(groupId)
        setShowAddMemberModal(null)
        setAddMemberSearch("")
      }
    } catch {
      setError("Error al agregar miembro")
    }
  }

  const handleRemoveMember = async (groupId: number, contactId: number) => {
    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members?contactId=${contactId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchData()
        if (groupMembers[groupId]) {
          const membersRes = await fetch(`/api/contact-groups/${groupId}/members`)
          if (membersRes.ok) {
            const members = await membersRes.json()
            setGroupMembers(prev => ({ ...prev, [groupId]: members }))
          }
        }
      }
    } catch {
      setError("Error al remover miembro")
    }
  }

  const loadGroupMembers = async (groupId: number) => {
    try {
      const res = await fetch(`/api/contact-groups/${groupId}/members`)
      if (res.ok) {
        const members = await res.json()
        setGroupMembers(prev => ({ ...prev, [groupId]: members }))
      }
    } catch {
      setError("Error al cargar miembros del grupo")
    }
  }

  // Filtrar grupos por término de búsqueda
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentGroups = filteredGroups.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage)

  // Filtrar contactos disponibles para agregar
  const availableContacts = contacts.filter(contact =>
    !groupMembers[showMembers]?.some(m => m.contactId === contact.id) &&
    (contact.name.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
     contact.email.toLowerCase().includes(addMemberSearch.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Crear Nuevo Grupo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
            <input name="name" value={form.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" rows={1} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Guardando..." : "Crear Grupo"}
        </button>
      </form>

      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Filtro de búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Grupos de Contactos</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">
              {filteredGroups.length} grupo{filteredGroups.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembros</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">Cargando...</td></tr>
              ) : currentGroups.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-400">
                  {searchTerm ? "No hay grupos que coincidan con la búsqueda" : "Sin grupos"}
                </td></tr>
              ) : currentGroups.map(group => (
                <tr key={group.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{group.name}</td>
                  <td className="px-6 py-4">{group.description || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.memberCount} contacto{group.memberCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          if (showMembers === group.id) {
                            setShowMembers(null)
                          } else {
                            setShowMembers(group.id)
                            if (!groupMembers[group.id]) {
                              await loadGroupMembers(group.id)
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {showMembers === group.id ? "Ocultar" : "Ver"} miembros
                      </button>
                      <button
                        onClick={() => setShowAddMemberModal(group.id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Agregar miembro
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredGroups.length)} de {filteredGroups.length} grupos
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de gestión de miembros */}
      {showMembers && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Miembros del Grupo</h3>
            <button
              onClick={() => setShowMembers(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {groupMembers[showMembers]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupMembers[showMembers].map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{member.contact.name}</div>
                      <div className="text-xs text-gray-600 truncate">{member.contact.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(showMembers, member.contactId)}
                      className="ml-2 text-red-600 hover:text-red-900 text-sm p-1"
                      title="Remover miembro"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Sin miembros en este grupo</p>
            )}
          </div>
        </div>
      )}

      {/* Modal para agregar miembros */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Agregar Miembro</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(null)
                  setAddMemberSearch("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar contactos..."
                value={addMemberSearch}
                onChange={(e) => setAddMemberSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableContacts.length > 0 ? (
                availableContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{contact.name}</div>
                      <div className="text-xs text-gray-600 truncate">{contact.email}</div>
                    </div>
                    <button
                      onClick={() => handleAddMember(showAddMemberModal, contact.id)}
                      className="ml-2 text-green-600 hover:text-green-900 text-sm px-2 py-1 rounded"
                    >
                      Agregar
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {addMemberSearch ? "No hay contactos que coincidan con la búsqueda" : "Todos los contactos ya están en el grupo"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}