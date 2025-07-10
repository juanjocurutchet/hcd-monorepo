"use client"

import { Calendar, MapPin, Plus } from "lucide-react"
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

export default function ListaActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return
    }

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setActivities(activities.filter(activity => activity.id !== id))
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (response.ok) {
        setActivities(activities.map(activity =>
          activity.id === id
            ? { ...activity, isPublished: !currentStatus }
            : activity
        ))
      }
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'published') return activity.isPublished
    if (filter === 'draft') return !activity.isPublished
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando actividades...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Lista de Actividades</h1>
        {/* Botones de vista calendario y nueva actividad eliminados */}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({activities.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'published'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Publicadas ({activities.filter(a => a.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'draft'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Borradores ({activities.filter(a => !a.isPublished).length})
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay actividades
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' && 'Aún no se han creado actividades.'}
              {filter === 'published' && 'No hay actividades publicadas.'}
              {filter === 'draft' && 'No hay borradores de actividades.'}
            </p>
            <Link
              href="/admin-panel/actividades/nueva"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Actividad
            </Link>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {activity.title}
                    </h3>
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

                  <p className="text-gray-600 mb-3">{activity.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(activity.date)}
                    </div>
                    {activity.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {activity.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* Botones de editar, eliminar y publicar/ocultar eliminados */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}