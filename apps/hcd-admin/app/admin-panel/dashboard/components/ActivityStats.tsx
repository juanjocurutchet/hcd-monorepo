"use client"

import { Calendar, Clock, TrendingUp, Users } from "lucide-react"
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

interface ActivityStats {
  total: number
  published: number
  drafts: number
  thisMonth: number
  upcoming: number
}

export default function ActivityStats() {
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    published: 0,
    drafts: 0,
    thisMonth: 0,
    upcoming: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const activities: Activity[] = await response.json()

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const stats: ActivityStats = {
          total: activities.length,
          published: activities.filter(a => a.isPublished).length,
          drafts: activities.filter(a => !a.isPublished).length,
          thisMonth: activities.filter(a => {
            const activityDate = new Date(a.date)
            return activityDate >= startOfMonth && activityDate <= endOfMonth
          }).length,
          upcoming: activities.filter(a => {
            const activityDate = new Date(a.date)
            return activityDate > now
          }).length
        }

        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Activities */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Actividades</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Published Activities */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Publicadas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
          </div>
        </div>
      </div>

      {/* This Month */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Este Mes</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Próximas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
          </div>
        </div>
      </div>
    </div>
  )
}