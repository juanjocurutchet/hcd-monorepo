"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
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

interface WeekViewProps {
  activities: Activity[]
  currentDate: Date
  onNavigateWeek: (direction: 'prev' | 'next') => void
  onSelectActivity: (activity: Activity) => void
}

export default function WeekView({
  activities,
  currentDate,
  onNavigateWeek,
  onSelectActivity
}: WeekViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para que la semana empiece en lunes

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek.setDate(diff + i))
      weekDays.push(dayDate)
    }
    return weekDays
  }

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate()
      )
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' })
  }

  const formatDayNumber = (date: Date) => {
    return date.getDate()
  }

  function getArgentinaDate(date: Date) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  }

  const isToday = (date: Date) => {
    const nowAR = getArgentinaDate(new Date())
    const dateAR = getArgentinaDate(date)
    return (
      nowAR.getFullYear() === dateAR.getFullYear() &&
      nowAR.getMonth() === dateAR.getMonth() &&
      nowAR.getDate() === dateAR.getDate()
    )
  }

  const weekDays = getWeekDays(currentDate)

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigateWeek('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          Semana del {weekDays[0]?.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long'
          })} al {weekDays[6]?.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </h3>
        <button
          onClick={() => onNavigateWeek('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="text-center p-2">
            <div className={`text-sm font-medium ${
              isToday(day) ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {formatDayName(day)}
            </div>
            <div className={`text-lg font-bold ${
              isToday(day) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {formatDayNumber(day)}
            </div>
          </div>
        ))}

        {/* Day Content */}
        {weekDays.map((day, dayIndex) => {
          const dayActivities = getActivitiesForDate(day)
          return (
            <div
              key={dayIndex}
              className={`min-h-[200px] p-2 border border-gray-200 rounded-lg ${
                isToday(day) ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
            >
              <div className="space-y-2">
                {dayActivities.map(activity => (
                  <div
                    key={activity.id}
                    onClick={() => onSelectActivity(activity)}
                    className="p-2 bg-blue-100 text-blue-800 rounded text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                  >
                    <div className="font-medium truncate">{activity.title}</div>
                    <div className="text-blue-600">{formatTime(activity.date)}</div>
                    {activity.location && (
                      <div className="text-blue-500 truncate">📍 {activity.location}</div>
                    )}
                  </div>
                ))}
                {dayActivities.length === 0 && (
                  <div className="text-gray-400 text-xs text-center py-4">
                    Sin actividades
                  </div>
                )}
              </div>
            </div>
          )
        })}
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