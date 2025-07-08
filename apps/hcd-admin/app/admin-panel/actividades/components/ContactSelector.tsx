"use client"

import { Select } from "antd"
import { User, Users, X } from "lucide-react"
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
  compact?: boolean
}

export default function ContactSelector({ value, onChange }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetchContactsAndGroups()
  }, [])

  useEffect(() => {
    // Actualizar chips seleccionados desde value externo
    if (value) {
      const emails = value.split(',').map(v => v.trim()).filter(Boolean)
      setSelected(emails)
    } else {
      setSelected([])
    }
  }, [value])

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

  // Unificar contactos y grupos en las opciones del select
  const options = [
    ...contacts.map(contact => ({
      label: (
        <span className="flex items-center gap-2"><User className="w-4 h-4 text-blue-600" />{contact.name}<span className="text-gray-500">({contact.email})</span></span>
      ),
      value: contact.email,
      type: 'contact',
      email: contact.email,
      name: contact.name
    })),
    ...groups.map(group => ({
      label: (
        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-600" />{group.name}<span className="text-gray-500">({group.memberCount} miembros)</span></span>
      ),
      value: `group:${group.id}`,
      type: 'group',
      groupId: group.id,
      name: group.name
    }))
  ]

  // Cuando cambia la selección en el select
  const handleChange = (selectedValues: string[]) => {
    // Convertir los values del select a emails
    const emails: string[] = []
    selectedValues.forEach(val => {
      if (val.startsWith('group:')) {
        const groupId = Number(val.replace('group:', ''))
        const group = groups.find(g => g.id === groupId)
        if (group) {
          group.members.forEach(m => emails.push(m.contact.email))
        }
      } else {
        emails.push(val)
      }
    })
    // Quitar duplicados
    const uniqueEmails = Array.from(new Set(emails))
    setSelected(uniqueEmails)
    onChange(uniqueEmails.join(', '))
  }

  // El value del select solo debe contener los valores seleccionados de contactos y grupos (no emails personalizados)
  const selectValue = selected
    .map(email => {
      const contact = contacts.find(c => c.email === email)
      if (contact) return contact.email
      const group = groups.find(g => g.members.some(m => m.contact.email === email))
      if (group) return `group:${group.id}`
      return null
    })
    .filter(Boolean) as string[]

  // Eliminar chip
  const handleRemoveChip = (email: string) => {
    const newSelected = selected.filter(e => e !== email)
    setSelected(newSelected)
    onChange(newSelected.join(', '))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Agregar contactos o grupos</label>
      <Select
        mode="multiple"
        showSearch
        allowClear
        loading={loading}
        style={{ width: 340, minWidth: 220, maxWidth: '100%' }}
        dropdownMatchSelectWidth={false}
        placeholder="Agregar contactos o grupos…"
        value={selectValue}
        onChange={handleChange}
        options={options}
        optionLabelProp="label"
        maxTagCount={0}
        filterOption={(input, option) => {
          if (!option) return false;
          const label = (option.label as any)?.props?.children?.map ? (option.label as any).props.children.map((c: any) => typeof c === 'string' ? c : c.props?.children).join(' ') : option.label;
          return label.toLowerCase().includes(input.toLowerCase());
        }}
      />
      {/* Chips debajo del input */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map(email => {
          const contact = contacts.find(c => c.email === email)
          if (contact) {
            return (
              <div key={email} className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                <User className="w-3 h-3 mr-1" />
                {contact.name} <span className="mx-1">|</span> {contact.email}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleRemoveChip(email)} />
              </div>
            )
          }
          const group = groups.find(g => g.members.some(m => m.contact.email === email))
          if (group) {
            return (
              <div key={email + group.id} className="flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                <Users className="w-3 h-3 mr-1" />
                {group.name}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleRemoveChip(email)} />
              </div>
            )
          }
          // Email personalizado (por si acaso)
          return (
            <div key={email} className="flex items-center px-2 py-1 rounded-full bg-gray-200 text-gray-800 text-xs">
              {email}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleRemoveChip(email)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}