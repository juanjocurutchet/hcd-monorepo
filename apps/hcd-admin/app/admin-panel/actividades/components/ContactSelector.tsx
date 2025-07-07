"use client"

import { Mail, Plus, User, Users, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Contact {
  id: number
  name: string
  email: string
  role: string
}

interface ContactGroup {
  id: number
  name: string
  description: string
  memberCount: number
  members: Array<{
    id: number
    contactId: number
    contact: Contact
  }>
}

interface ContactSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function ContactSelector({ value, onChange }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [selectedGroups, setSelectedGroups] = useState<ContactGroup[]>([])
  const [customEmail, setCustomEmail] = useState("")
  const [showCustomEmail, setShowCustomEmail] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactsAndGroups()
  }, [])

  useEffect(() => {
    // Convertir el string de emails a arrays de contactos y grupos seleccionados
    if (value) {
      const emails = value.split(',').map(e => e.trim()).filter(e => e)
      const selectedContactsList: Contact[] = []
      const selectedGroupsList: ContactGroup[] = []

      // Procesar emails que corresponden a contactos individuales
      emails.forEach(email => {
        const contact = contacts.find(c => c.email === email)
        if (contact) {
          selectedContactsList.push(contact)
        }
      })

      // Procesar emails que corresponden a grupos
      groups.forEach(group => {
        const groupEmails = group.members.map(m => m.contact.email)
        const hasGroupEmails = groupEmails.some(email => emails.includes(email))
        if (hasGroupEmails) {
          selectedGroupsList.push(group)
        }
      })

      setSelectedContacts(selectedContactsList)
      setSelectedGroups(selectedGroupsList)
    }
  }, [value, contacts, groups])

  const fetchContactsAndGroups = async () => {
    try {
      const response = await fetch('/api/contacts-and-groups')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Error fetching contacts and groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleContact = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.email === contact.email)

    if (isSelected) {
      const newContacts = selectedContacts.filter(c => c.email !== contact.email)
      setSelectedContacts(newContacts)
      updateEmails(newContacts, selectedGroups)
    } else {
      const newContacts = [...selectedContacts, contact]
      setSelectedContacts(newContacts)
      updateEmails(newContacts, selectedGroups)
    }
  }

  const handleToggleGroup = (group: ContactGroup) => {
    const isSelected = selectedGroups.some(g => g.id === group.id)

    if (isSelected) {
      const newGroups = selectedGroups.filter(g => g.id !== group.id)
      setSelectedGroups(newGroups)
      updateEmails(selectedContacts, newGroups)
    } else {
      const newGroups = [...selectedGroups, group]
      setSelectedGroups(newGroups)
      updateEmails(selectedContacts, newGroups)
    }
  }

  const updateEmails = (contacts: Contact[], groups: ContactGroup[]) => {
    const allEmails = new Set<string>()

    // Agregar emails de contactos individuales
    contacts.forEach(contact => allEmails.add(contact.email))

    // Agregar emails de grupos
    groups.forEach(group => {
      group.members.forEach(member => allEmails.add(member.contact.email))
    })

    onChange(Array.from(allEmails).join(', '))
  }

  const handleAddCustomEmail = () => {
    if (customEmail && !selectedContacts.some(c => c.email === customEmail)) {
      const newContact: Contact = {
        id: Date.now(),
        name: customEmail,
        email: customEmail,
        role: "Personalizado"
      }

      const newContacts = [...selectedContacts, newContact]
      setSelectedContacts(newContacts)
      updateEmails(newContacts, selectedGroups)
      setCustomEmail("")
      setShowCustomEmail(false)
    }
  }

  const handleRemoveContact = (email: string) => {
    const newContacts = selectedContacts.filter(c => c.email !== email)
    setSelectedContacts(newContacts)
    updateEmails(newContacts, selectedGroups)
  }

  const handleRemoveGroup = (groupId: number) => {
    const newGroups = selectedGroups.filter(g => g.id !== groupId)
    setSelectedGroups(newGroups)
    updateEmails(selectedContacts, newGroups)
  }

  const handleSelectAll = () => {
    setSelectedContacts(contacts)
    setSelectedGroups(groups)
    updateEmails(contacts, groups)
  }

  const handleClearAll = () => {
    setSelectedContacts([])
    setSelectedGroups([])
    onChange("")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Contactos para notificaciones
          </label>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Cargando contactos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Contactos para notificaciones
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Seleccionar todos
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grupos de contactos */}
      {groups.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Grupos de contactos</h4>
          <div className="grid grid-cols-1 gap-2">
            {groups.map((group) => (
              <label
                key={group.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.some(g => g.id === group.id)}
                  onChange={() => handleToggleGroup(group)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{group.name}</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {group.memberCount} contacto{group.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Contactos individuales */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Contactos individuales</h4>
          <div className="grid grid-cols-1 gap-2">
            {contacts.map((contact) => (
              <label
                key={contact.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.some(c => c.email === contact.email)}
                  onChange={() => handleToggleContact(contact)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                    {contact.role && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {contact.role}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <Mail className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-600">{contact.email}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Email personalizado */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Email personalizado</h4>
          <button
            type="button"
            onClick={() => setShowCustomEmail(!showCustomEmail)}
            className="flex items-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            <Plus className="w-3 h-3 mr-1" />
            {showCustomEmail ? "Cancelar" : "Agregar"}
          </button>
        </div>

        {showCustomEmail && (
          <div className="flex space-x-2">
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleAddCustomEmail}
              disabled={!customEmail}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Agregar
            </button>
          </div>
        )}
      </div>

      {/* Contactos seleccionados */}
      {(selectedContacts.length > 0 || selectedGroups.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Seleccionados</h4>

          {/* Grupos seleccionados */}
          {selectedGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">{group.name}</span>
                <span className="ml-2 text-xs text-blue-700">({group.memberCount} contacto{group.memberCount !== 1 ? 's' : ''})</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveGroup(group.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Contactos individuales seleccionados */}
          {selectedContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">{contact.name}</span>
                <span className="ml-2 text-xs text-blue-700">({contact.email})</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveContact(contact.email)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedContacts.length === 0 && selectedGroups.length === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ No se enviarán notificaciones. Selecciona al menos un contacto o grupo.
          </p>
        </div>
      )}
    </div>
  )
}