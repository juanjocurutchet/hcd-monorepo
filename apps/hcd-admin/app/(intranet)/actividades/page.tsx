"use client"

import { ChevronLeft, ChevronRight, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import DayView from "./components/DayView"
import NotificationManager from "./components/NotificationManager"
import WeekView from "./components/WeekView"

interface Activity {
  id: number
  title: string
  description: string
  location?: string
  date: string
  imageUrl?: string
  isPublished: boolean
}

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [loading, setLoading] = useState(true)

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []

    // Días del mes anterior
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleSelectActivity = (activity: Activity) => {
    // Aquí puedes implementar la lógica para mostrar detalles de la actividad
  }

  const getArgentinaDate = (date: Date) => {
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

  const isTomorrow = (date: Date) => {
    const nowAR = getArgentinaDate(new Date())
    const dateAR = getArgentinaDate(date)
    const tomorrow = new Date(nowAR)
    tomorrow.setDate(nowAR.getDate() + 1)
    return (
      tomorrow.getFullYear() === dateAR.getFullYear() &&
      tomorrow.getMonth() === dateAR.getMonth() &&
      tomorrow.getDate() === dateAR.getDate()
    )
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)

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
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Actividades</h1>
        <div className="flex space-x-4">
          <Link
            href="/admin-panel/actividades/lista"
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Vista Lista
          </Link>
          <Link
            href="/admin-panel/actividades/nueva"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Actividad
          </Link>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded ${
                view === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Día
            </button>
          </div>
        </div>

                {/* Calendar Views */}
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map(({ date, isCurrentMonth }, index) => {
              const dayActivities = getActivitiesForDate(date)
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    min-h-[120px] p-2 border border-gray-200 cursor-pointer
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isToday(date) ? 'bg-blue-50 border-blue-300' : ''}
                    ${isSelected(date) ? 'ring-2 ring-blue-500' : ''}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isToday(date) ? 'text-blue-600 font-bold' : ''}
                  `}>
                    {date.getDate()}
                  </div>

                  {/* Activities for this day */}
                  <div className="space-y-1">
                    {dayActivities.slice(0, 2).map(activity => (
                      <div
                        key={activity.id}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={activity.title}
                      >
                        {activity.title}
                      </div>
                    ))}
                    {dayActivities.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayActivities.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === 'week' && (
          <WeekView
            activities={activities}
            currentDate={currentDate}
            onNavigateWeek={navigateWeek}
            onSelectActivity={handleSelectActivity}
          />
        )}

        {view === 'day' && (
          <DayView
            activities={activities}
            currentDate={currentDate}
            onNavigateDay={navigateDay}
            onSelectActivity={handleSelectActivity}
          />
        )}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-3">
            {formatDate(selectedDate)}
          </h3>
          <div className="space-y-2">
            {getActivitiesForDate(selectedDate).map(activity => (
              <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.description}</div>
                {activity.location && (
                  <div className="text-sm text-gray-500">📍 {activity.location}</div>
                )}
                <div className="text-sm text-gray-500">
                  🕒 {new Date(activity.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
            {getActivitiesForDate(selectedDate).length === 0 && (
              <p className="text-gray-500">No hay actividades programadas para este día.</p>
            )}
          </div>
        </div>
      )}

      {/* Notification Manager */}
      <NotificationManager />
    </div>
  )
}