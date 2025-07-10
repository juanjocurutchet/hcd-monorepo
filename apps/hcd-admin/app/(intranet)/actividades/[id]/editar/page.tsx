"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ContactSelector from "../../components/ContactSelector"
import EmailChipsInput from "../../components/EmailChipsInput"
import NotificationFrequencySelector from "../../components/NotificationFrequencySelector"

interface Activity {
  id: number
  title: string
  description: string
  location?: string
  date: string
  imageUrl?: string
  isPublished: boolean
  enableNotifications?: boolean
  notificationAdvance?: string
  notificationEmails?: string
}

interface ActivityForm {
  title: string
  description: string
  location: string
  date: string
  time: string
  imageUrl: string
  isPublished: boolean
  enableNotifications: boolean
  notificationAdvance: string
  notificationEmails: string
  customEmail?: string
}

function getArgentinaDateString(dateUTC: Date) {
  const dateAR = new Date(dateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const yyyy = dateAR.getFullYear()
  const mm = String(dateAR.getMonth() + 1).padStart(2, '0')
  const dd = String(dateAR.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getArgentinaTimeString(dateUTC: Date) {
  const dateAR = new Date(dateUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const hh = String(dateAR.getHours()).padStart(2, '0')
  const min = String(dateAR.getMinutes()).padStart(2, '0')
  return `${hh}:${min}`
}

export default function EditarActividadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [form, setForm] = useState<ActivityForm>({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    imageUrl: "",
    isPublished: true,
    enableNotifications: true,
    notificationAdvance: "24",
    notificationEmails: "",
    customEmail: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchActivity()
  }, [params.id])

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setActivity(data)

        // Convertir la fecha ISO a fecha y hora separadas
        const activityDate = new Date(data.date)
        const dateStr = getArgentinaDateString(activityDate)
        const timeStr = getArgentinaTimeString(activityDate)

        setForm({
          title: data.title,
          description: data.description,
          location: data.location || "",
          date: dateStr,
          time: timeStr,
          imageUrl: data.imageUrl || "",
          isPublished: data.isPublished,
          enableNotifications: data.enableNotifications ?? true,
          notificationAdvance: data.notificationAdvance ?? "24",
          notificationEmails: data.notificationEmails || "",
          customEmail: data.customEmail || ""
        })
      } else {
        setError('Actividad no encontrada')
      }
    } catch (error) {
      setError('Error al cargar la actividad')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Combinar fecha y hora en local (Argentina)
      const [year, month, day] = form.date.split('-').map(Number)
      const [hour, minute] = form.time.split(':').map(Number)
      const dateTime = new Date(year, month - 1, day, hour, minute)

      const activityData = {
        title: form.title,
        description: form.description,
        location: form.location,
        date: dateTime.toISOString(),
        imageUrl: form.imageUrl || null,
        isPublished: form.isPublished,
        enableNotifications: form.enableNotifications,
        notificationAdvance: form.notificationAdvance,
        notificationEmails: form.notificationEmails || null,
        customEmail: form.customEmail || null
      }

      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      })

      if (response.ok) {
        router.push('/admin-panel/actividades')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar la actividad')
      }
    } catch (error) {
      setError('Error al actualizar la actividad')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ActivityForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Cargando actividad...</span>
      </div>
    )
  }

  if (error && !activity) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Editar Actividad</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </button>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Actividad *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Sesión Ordinaria del Concejo"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe los detalles de la actividad..."
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Salón del Concejo Deliberante"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
              Actividad publicada
            </label>
          </div>

          {/* Accordion para notificaciones (igual que en nueva) */}
          <Accordion type="single" collapsible>
            <AccordionItem value="notificaciones">
              <AccordionTrigger>
                <span className="text-lg font-medium text-gray-900">Notificaciones</span>
              </AccordionTrigger>
              <AccordionContent>
                {/* Habilitar notificaciones */}
                <div className="flex items-center mb-4 mt-6">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={form.enableNotifications}
                    onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700">
                    Habilitar notificaciones por email
                  </label>
                </div>
                {form.enableNotifications && (
                  <>
                    {/* Frecuencia de notificación */}
                    <div className="mb-6">
                      <NotificationFrequencySelector
                        value={form.notificationAdvance}
                        onChange={(value) => handleInputChange('notificationAdvance', value)}
                      />
                    </div>
                    {/* Contactos y grupos */}
                    <div className="mb-6">
                      <ContactSelector
                        value={form.notificationEmails}
                        onChange={(value) => handleInputChange('notificationEmails', value)}
                        compact
                      />
                    </div>
                    {/* Email personalizado (chips) */}
                    <div className="mb-6">
                      <EmailChipsInput
                        value={form.customEmail || ""}
                        onChange={emails => handleInputChange('customEmail', emails)}
                      />
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}