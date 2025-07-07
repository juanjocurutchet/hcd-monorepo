"use client"

import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { useState } from "react"

interface Activity {
  id: number
  title: string
  description: string
  location?: string
  date: string
  imageUrl?: string
  isPublished: boolean
}

interface DayViewProps {
  activities: Activity[]
  currentDate: Date
  onNavigateDay: (direction: 'prev' | 'next') => void
  onSelectActivity: (activity: Activity) => void
}

export default function DayView({
  activities,
  currentDate,
  onNavigateDay,
  onSelectActivity
}: DayViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate.toDateString() === date.toDateString()
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString()
  }

  const dayActivities = getActivitiesForDate(currentDate)

  // Generar horas del día (6 AM a 10 PM)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6)

  return (
    <div className="space-y-4">
      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigateDay('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className={`text-xl font-semibold ${
          isToday(currentDate) ? 'text-blue-600' : 'text-gray-900'
        }`}>
          {formatDate(currentDate)}
          {isToday(currentDate) && <span className="ml-2 text-sm">(Hoy)</span>}
        </h3>
        <button
          onClick={() => onNavigateDay('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Schedule */}
      <div className="bg-white rounded-lg shadow border">
        {dayActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay actividades programadas
            </h4>
            <p className="text-gray-500">
              Este día no tiene actividades programadas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {dayActivities.map((activity, index) => (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {activity.title}
                      </h4>
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
                    <p className="text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(activity.date)}
                      </div>
                      {activity.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline View (Alternative) */}
      <div className="bg-white rounded-lg shadow border p-4">
        <h4 className="text-lg font-semibold mb-4">Timeline del Día</h4>
        <div className="space-y-2">
          {hours.map(hour => {
            const hourActivities = dayActivities.filter(activity => {
              const activityHour = new Date(activity.date).getHours()
              return activityHour === hour
            })

            return (
              <div key={hour} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-500">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 min-h-[40px] border-l-2 border-gray-200 pl-4">
                  {hourActivities.map(activity => (
                    <div
                      key={activity.id}
                      onClick={() => onSelectActivity(activity)}
                      className="mb-2 p-2 bg-blue-100 text-blue-800 rounded text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                    >
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-blue-600 text-xs">{formatTime(activity.date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">{selectedActivity.title}</h3>
            <p className="text-gray-600 mb-3">{selectedActivity.description}</p>
            {selectedActivity.location && (
              <p className="text-gray-500 mb-2">📍 {selectedActivity.location}</p>
            )}
            <p className="text-gray-500 mb-4">
              🕒 {new Date(selectedActivity.date).toLocaleString('es-ES')}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}