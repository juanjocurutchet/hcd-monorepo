"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Snowflake, Sun, Thermometer, Droplets, Wind } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
  city: string
  source: string
}

export default function WeatherWidgetArgentina() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)

        // Usamos nuestra API proxy que combina datos de diferentes fuentes
        const response = await fetch("/api/weather", { cache: "no-store" })

        if (!response.ok) {
          throw new Error("No se pudieron obtener los datos del clima")
        }

        const data = await response.json()
        setWeather(data)
      } catch (err) {
        console.error("Error al obtener datos del clima:", err)
        setError("No se pudieron cargar los datos del clima")

        // Datos de respaldo
        setWeather({
          temperature: 18,
          condition: "Clear",
          description: "Cielo despejado",
          humidity: 65,
          windSpeed: 10,
          icon: "01d",
          city: "Las Flores, Buenos Aires",
          source: "Datos de respaldo",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Actualizar cada 30 minutos
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-6 w-6 text-yellow-500" />

    switch (weather.condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-6 w-6 text-gray-300" />
      case "rain":
      case "drizzle":
        return <CloudRain className="h-6 w-6 text-blue-300" />
      case "snow":
        return <Snowflake className="h-6 w-6 text-blue-200" />
      default:
        return <Thermometer className="h-6 w-6 text-red-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-white animate-pulse">
        <Sun className="h-5 w-5" />
        <span>Cargando...</span>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="flex items-center space-x-1 text-white">
        <Sun className="h-5 w-5" />
        <span>Clima no disponible</span>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-white/10 rounded-lg p-2">
      <div className="text-3xl font-bold mr-3">{weather?.temperature}°C</div>
      <div className="text-sm">
        <div className="flex items-center">
          {getWeatherIcon()}
          <span className="ml-1 capitalize">{weather?.description}</span>
        </div>
        <div className="flex items-center text-xs text-gray-200 mt-1">
          <span>{weather?.city}</span>
        </div>
        <div className="flex items-center text-xs space-x-2 mt-1">
          <div className="flex items-center">
            <Droplets className="h-3 w-3 mr-1" />
            <span>{weather?.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-3 w-3 mr-1" />
            <span>{weather?.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  )
}
