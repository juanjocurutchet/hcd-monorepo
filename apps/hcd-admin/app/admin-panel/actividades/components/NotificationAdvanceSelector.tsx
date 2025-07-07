"use client"

import { useEffect, useState } from "react"

interface NotificationAdvanceOption {
  value: string
  label: string
  hours: number
}

const ADVANCE_OPTIONS: NotificationAdvanceOption[] = [
  { value: "168", label: "1 semana antes", hours: 168 },
  { value: "72", label: "3 días antes", hours: 72 },
  { value: "48", label: "2 días antes", hours: 48 },
  { value: "24", label: "1 día antes", hours: 24 },
  { value: "12", label: "12 horas antes", hours: 12 },
  { value: "6", label: "6 horas antes", hours: 6 },
  { value: "2", label: "2 horas antes", hours: 2 },
  { value: "1", label: "1 hora antes", hours: 1 },
]

interface NotificationAdvanceSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function NotificationAdvanceSelector({ value, onChange }: NotificationAdvanceSelectorProps) {
  const [selectedAdvances, setSelectedAdvances] = useState<string[]>([])

  useEffect(() => {
    // Convertir el string de anticipaciones a array
    if (value) {
      setSelectedAdvances(value.split(',').map(v => v.trim()).filter(v => v))
    } else {
      setSelectedAdvances(["24"]) // Por defecto 1 día
    }
  }, [value])

  const handleToggleAdvance = (advanceValue: string) => {
    const newSelected = selectedAdvances.includes(advanceValue)
      ? selectedAdvances.filter(v => v !== advanceValue)
      : [...selectedAdvances, advanceValue]

    // Ordenar por horas (mayor a menor)
    const sortedAdvances = newSelected.sort((a, b) => {
      const aHours = ADVANCE_OPTIONS.find(opt => opt.value === a)?.hours || 0
      const bHours = ADVANCE_OPTIONS.find(opt => opt.value === b)?.hours || 0
      return bHours - aHours
    })

    setSelectedAdvances(sortedAdvances)
    onChange(sortedAdvances.join(','))
  }

  const handleSelectAll = () => {
    const allValues = ADVANCE_OPTIONS.map(opt => opt.value)
    setSelectedAdvances(allValues)
    onChange(allValues.join(','))
  }

  const handleClearAll = () => {
    setSelectedAdvances([])
    onChange("")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Anticipación de notificación
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Seleccionar todas
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

      <div className="grid grid-cols-2 gap-2">
        {ADVANCE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedAdvances.includes(option.value)}
              onChange={() => handleToggleAdvance(option.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {selectedAdvances.length > 0 && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Anticipaciones seleccionadas:</strong> {
              selectedAdvances
                .map(advance => ADVANCE_OPTIONS.find(opt => opt.value === advance)?.label)
                .join(', ')
            }
          </p>
        </div>
      )}

      {selectedAdvances.length === 0 && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ No se enviarán notificaciones automáticas. Selecciona al menos una anticipación.
          </p>
        </div>
      )}
    </div>
  )
}