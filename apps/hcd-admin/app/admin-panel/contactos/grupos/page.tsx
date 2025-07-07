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
        // Recargar miembros del grupo
        await loadGroupMembers(groupId)
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
        // Recargar miembros del grupo
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

      <div className="bg-white rounded-lg shadow">
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
            ) : groups.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Sin grupos</td></tr>
            ) : groups.map(group => (
              <tr key={group.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{group.name}</td>
                <td className="px-6 py-4">{group.description || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {group.memberCount} contacto{group.memberCount !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel de gestión de miembros */}
      {showMembers && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Gestión de Miembros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Miembros actuales */}
            <div>
              <h4 className="font-medium mb-2">Miembros del Grupo</h4>
              <div className="space-y-2">
                {groupMembers[showMembers]?.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{member.contact.name}</div>
                      <div className="text-sm text-gray-600">{member.contact.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(showMembers, member.contactId)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {(!groupMembers[showMembers] || groupMembers[showMembers].length === 0) && (
                  <p className="text-gray-500 text-sm">Sin miembros</p>
                )}
              </div>
            </div>

            {/* Agregar miembros */}
            <div>
              <h4 className="font-medium mb-2">Agregar Miembros</h4>
              <div className="space-y-2">
                {contacts
                  .filter(contact => !groupMembers[showMembers]?.some(m => m.contactId === contact.id))
                  .map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.email}</div>
                      </div>
                      <button
                        onClick={() => handleAddMember(showMembers, contact.id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                {contacts.filter(contact => !groupMembers[showMembers]?.some(m => m.contactId === contact.id)).length === 0 && (
                  <p className="text-gray-500 text-sm">Todos los contactos ya están en el grupo</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}