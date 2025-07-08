"use client"

import { X } from "lucide-react"
import { useRef, useState } from "react"

interface EmailChipsInputProps {
  value: string
  onChange: (emails: string) => void
}

export default function EmailChipsInput({ value, onChange }: EmailChipsInputProps) {
  const [input, setInput] = useState("")
  const [emails, setEmails] = useState<string[]>(value ? value.split(",").map(e => e.trim()).filter(Boolean) : [])
  const inputRef = useRef<HTMLInputElement>(null)

  const addEmail = (email: string) => {
    const clean = email.trim()
    if (clean && validateEmail(clean) && !emails.includes(clean)) {
      const newEmails = [...emails, clean]
      setEmails(newEmails)
      onChange(newEmails.join(", "))
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault()
      if (input) {
        addEmail(input)
        setInput("")
      }
    } else if (e.key === "Backspace" && !input && emails.length > 0) {
      // Eliminar el último chip con backspace
      removeEmail(emails[emails.length - 1]!)
    }
  }

  const removeEmail = (email: string) => {
    const newEmails = emails.filter(e => e !== email)
    setEmails(newEmails)
    onChange(newEmails.join(", "))
    // Focus al input después de eliminar
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Agregar emails personalizados</label>
      <div className="flex flex-wrap items-center gap-2 px-2 py-1 border border-gray-300 rounded-lg bg-white min-h-[42px] w-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
        {emails.map(email => (
          <div key={email} className="flex items-center px-2 py-1 rounded-full bg-gray-200 text-gray-800 text-xs mr-1 mb-1">
            {email}
            <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeEmail(email)} />
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] px-2 py-1 border-none outline-none text-sm bg-transparent"
          placeholder="Agregar emails separados por coma, enter o espacio"
        />
      </div>
      {input && !validateEmail(input) && (
        <p className="text-xs text-red-500 mt-1">Email inválido</p>
      )}
    </div>
  )
}