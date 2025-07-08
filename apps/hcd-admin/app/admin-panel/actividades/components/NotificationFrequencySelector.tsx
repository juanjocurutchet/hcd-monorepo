"use client"

import { useEffect, useState } from "react"

const QUICK_OPTIONS = [
  { value: "0_minutes", label: "Hora del evento" },
  { value: "10_minutes", label: "10 min antes" },
  { value: "1_hours", label: "1 hr antes" },
  { value: "1_days", label: "1 día antes" },
]

const UNITS = [
  { value: "minutes", label: "minutos" },
  { value: "hours", label: "horas" },
  { value: "days", label: "días" },
  { value: "weeks", label: "semanas" },
]

interface NotificationFrequencySelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function NotificationFrequencySelector({ value, onChange }: NotificationFrequencySelectorProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [customNumber, setCustomNumber] = useState<number>(1)
  const [customUnit, setCustomUnit] = useState<string>("minutes")
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    if (value) {
      setSelected(value.split(",").map(v => v.trim()).filter(Boolean))
    } else {
      setSelected([])
    }
  }, [value])

  const handleToggle = (val: string) => {
    let newSelected
    if (selected.includes(val)) {
      newSelected = selected.filter(v => v !== val)
    } else {
      newSelected = [...selected, val]
    }
    setSelected(newSelected)
    onChange(newSelected.join(", "))
  }

  const handleAddCustom = () => {
    const val = `${customNumber}_${customUnit}`
    if (!selected.includes(val)) {
      const newSelected = [...selected, val]
      setSelected(newSelected)
      onChange(newSelected.join(", "))
    }
    setShowCustom(false)
  }

  const handleRemoveChip = (val: string) => {
    const newSelected = selected.filter(v => v !== val)
    setSelected(newSelected)
    onChange(newSelected.join(", "))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Frecuencia de notificación
      </label>
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`px-3 py-1 rounded border text-sm ${selected.includes(opt.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"}`}
            onClick={() => handleToggle(opt.value)}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          className={`px-3 py-1 rounded border text-sm ${showCustom ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"}`}
          onClick={() => setShowCustom(!showCustom)}
        >
          Personalizada
        </button>
        {showCustom && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="number"
              min={0}
              max={5}
              value={customNumber}
              onChange={e => setCustomNumber(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded"
            />
            <select
              value={customUnit}
              onChange={e => setCustomUnit(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded"
            >
              {UNITS.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="px-2 py-1 bg-blue-600 text-white rounded"
              onClick={handleAddCustom}
            >
              Agregar
            </button>
            <span className="text-gray-500 text-sm">antes del evento</span>
          </div>
        )}
      </div>
      {/* Chips de seleccionados */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map(val => {
          const quick = QUICK_OPTIONS.find(opt => opt.value === val)
          if (quick) {
            return (
              <div key={val} className="flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                {quick.label}
                <button className="ml-1" onClick={() => handleRemoveChip(val)}>&times;</button>
              </div>
            )
          }
          // Personalizada
          const match = val.match(/(\d+)_([a-z]+)/)
          if (match) {
            const num = match[1]
            const unit = UNITS.find(u => u.value === match[2])?.label || match[2]
            return (
              <div key={val} className="flex items-center px-2 py-1 rounded-full bg-gray-200 text-gray-800 text-xs">
                {num} {unit} antes del evento
                <button className="ml-1" onClick={() => handleRemoveChip(val)}>&times;</button>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}