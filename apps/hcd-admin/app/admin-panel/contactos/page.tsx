"use client"

import { useEffect, useState } from "react"

interface Contact {
  id: number
  name: string
  email: string
  position: string
}

// Cargos/posiciones predefinidos para el sistema
const POSITIONS = [
  { value: "", label: "Sin cargo" },
  { value: "concejal", label: "Concejal" },
  { value: "presidente", label: "Presidente del Concejo" },
  { value: "secretario", label: "Secretario" },
  { value: "secretario_bloque", label: "Secretario de Bloque" },
  { value: "asesor", label: "Asesor" },
  { value: "personal", label: "Personal Administrativo" },
  { value: "prensa", label: "Prensa y Comunicación" },
  { value: "tecnico", label: "Técnico" },
  { value: "otro", label: "Otro (especificar)" }
]

export default function ContactosPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", position: "" })
  const [saving, setSaving] = useState(false)

  // Filtros
  const [filterName, setFilterName] = useState("")
  const [filterEmail, setFilterEmail] = useState("")
  const [filterPosition, setFilterPosition] = useState("")

  const [customPosition, setCustomPosition] = useState("")

  // Estados para edición
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", position: "" })
  const [editCustomPosition, setEditCustomPosition] = useState("")
  const [editing, setEditing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estados para eliminación
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/contacts")
      const data = await res.json()
      setContacts(data)
    } catch {
      setError("Error al cargar contactos")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Si se selecciona "otro", limpiar el cargo personalizado
    if (e.target.name === "position" && e.target.value !== "otro") {
      setCustomPosition("")
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
    // Si se selecciona "otro", limpiar el cargo personalizado
    if (e.target.name === "position" && e.target.value !== "otro") {
      setEditCustomPosition("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    // Si se seleccionó "otro", usar el cargo personalizado
    const finalPosition = form.position === "otro" ? customPosition : form.position

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          position: finalPosition
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al crear contacto")
      } else {
        setForm({ name: "", email: "", position: "" })
        setCustomPosition("")
        fetchContacts()
      }
    } catch {
      setError("Error al crear contacto")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setEditForm({
      name: contact.name,
      email: contact.email,
      position: POSITIONS.find(p => p.value === contact.position)?.value || contact.position || ""
    })
    setEditCustomPosition(contact.position && !POSITIONS.find(p => p.value === contact.position) ? contact.position : "")
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact) return

    setEditing(true)
    setError("")

    // Si se seleccionó "otro", usar el cargo personalizado
    const finalPosition = editForm.position === "otro" ? editCustomPosition : editForm.position

    try {
      const res = await fetch(`/api/contacts/${editingContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          position: finalPosition
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al actualizar contacto")
      } else {
        setShowEditModal(false)
        setEditingContact(null)
        setEditForm({ name: "", email: "", position: "" })
        setEditCustomPosition("")
        fetchContacts()
      }
    } catch {
      setError("Error al actualizar contacto")
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = (contact: Contact) => {
    setDeletingContact(contact)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingContact) return

    setDeleting(true)
    setError("")

    try {
      const res = await fetch(`/api/contacts/${deletingContact.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al eliminar contacto")
      } else {
        setShowDeleteModal(false)
        setDeletingContact(null)
        fetchContacts()
      }
    } catch {
      setError("Error al eliminar contacto")
    } finally {
      setDeleting(false)
    }
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilterName("")
    setFilterEmail("")
    setFilterPosition("")
  }

  // Filtrar contactos por nombre, email y cargo
  const filteredContacts = contacts.filter(contact => {
    const matchesName = !filterName || contact.name.toLowerCase().includes(filterName.toLowerCase())
    const matchesEmail = !filterEmail || contact.email.toLowerCase().includes(filterEmail.toLowerCase())
    const matchesPosition = !filterPosition || contact.position === filterPosition

    return matchesName && matchesEmail && matchesPosition
  })

  // Verificar si hay filtros activos
  const hasActiveFilters = filterName || filterEmail || filterPosition

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input name="name" value={form.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
          <select name="position" value={form.position} onChange={handleInputChange} className="w-full px-3 py-2 border rounded">
            {POSITIONS.map(position => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? "Guardando..." : "Agregar"}</button>
      </form>

      {/* Campo para cargo personalizado */}
      {form.position === "otro" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Especificar cargo:</label>
          <input
            type="text"
            value={customPosition}
            onChange={(e) => setCustomPosition(e.target.value)}
            placeholder="Ej: Coordinador de Proyectos, Asistente Ejecutivo..."
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
      )}

      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por nombre:</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nombre del contacto..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por email:</label>
            <input
              type="text"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="Email del contacto..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por cargo:</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Todos los cargos</option>
              {POSITIONS.filter(position => position.value).map(position => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {filteredContacts.length} de {contacts.length} contactos
            </span>
            {hasActiveFilters && (
              <span className="text-sm text-blue-600">
                Filtros activos: {[filterName && "Nombre", filterEmail && "Email", filterPosition && "Cargo"].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Cargando...</td></tr>
            ) : filteredContacts.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">
                {hasActiveFilters ? "No hay contactos que coincidan con los filtros" : "Sin contactos"}
              </td></tr>
            ) : filteredContacts.map(contact => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {contact.position ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {POSITIONS.find(p => p.value === contact.position)?.label || contact.position}
                    </span>
                  ) : (
                    <span className="text-gray-500">Sin cargo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(contact)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Editar Contacto</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <select
                  name="position"
                  value={editForm.position}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  {POSITIONS.map(position => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo para cargo personalizado en edición */}
              {editForm.position === "otro" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificar cargo:</label>
                  <input
                    type="text"
                    value={editCustomPosition}
                    onChange={(e) => setEditCustomPosition(e.target.value)}
                    placeholder="Ej: Coordinador de Proyectos, Asistente Ejecutivo..."
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {editing ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el contacto <strong>{deletingContact.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}