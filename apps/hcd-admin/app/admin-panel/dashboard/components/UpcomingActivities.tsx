"use client"

import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Activity {
  id: number
  title: string
  description: string
  location?: string
  date: string
  imageUrl?: string
  isPublished: boolean
}

export default function UpcomingActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingActivities()
  }, [])

  const fetchUpcomingActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const allActivities: Activity[] = await response.json()

        // Filtrar actividades futuras y ordenar por fecha
        const nowAR = getArgentinaDate(new Date())
        const upcoming = allActivities
          .filter(activity => getArgentinaDate(new Date(activity.date)) > nowAR)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5) // Mostrar solo las próximas 5

        setActivities(upcoming)
      }
    } catch (error) {
      console.error('Error fetching upcoming activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getArgentinaDate = (date: Date) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  }

  const getDaysUntil = (dateString: string) => {
    const activityDateAR = getArgentinaDate(new Date(dateString))
    const nowAR = getArgentinaDate(new Date())
    // Normalizar a medianoche para comparar solo fechas
    const activityMidnight = new Date(activityDateAR.getFullYear(), activityDateAR.getMonth(), activityDateAR.getDate())
    const nowMidnight = new Date(nowAR.getFullYear(), nowAR.getMonth(), nowAR.getDate())
    const diffTime = activityMidnight.getTime() - nowMidnight.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays < 7) return `En ${diffDays} días`
    return `En ${Math.ceil(diffDays / 7)} semanas`
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Próximas Actividades</h2>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Próximas Actividades</h2>
        <Link
          href="/admin-panel/actividades"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Ver todas
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay actividades próximas
          </h3>
          <p className="text-gray-500 mb-4">
            No hay actividades programadas para los próximos días.
          </p>
          <Link
            href="/admin-panel/actividades/nueva"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Actividad
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${activity.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    `}>
                      {activity.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {activity.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(activity.date)}
                    </div>
                    {activity.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {activity.location}
                      </div>
                    )}
                    <div className="text-blue-600 font-medium">
                      {getDaysUntil(activity.date)}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/admin-panel/actividades/${activity.id}/editar`}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <Link
              href="/admin-panel/actividades/nueva"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar nueva actividad
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}