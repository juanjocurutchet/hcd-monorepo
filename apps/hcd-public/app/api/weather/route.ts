import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Intentamos obtener datos del SMN de Argentina
    // Nota: El SMN no tiene una API pública oficial, esto es un ejemplo
    // En un caso real, podríamos implementar web scraping del sitio oficial

    // Usamos OpenWeatherMap con coordenadas exactas como respaldo
    const openWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=-36.0156&lon=-59.0967&units=metric&lang=es&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`,
      { cache: "no-store" },
    )

    if (!openWeatherResponse.ok) {
      throw new Error("Error al obtener datos de OpenWeatherMap")
    }

    const openWeatherData = await openWeatherResponse.json()

    // Transformamos los datos al formato que necesitamos
    const weatherData = {
      temperature: Math.round(openWeatherData.main.temp),
      condition: openWeatherData.weather[0].main,
      description: openWeatherData.weather[0].description,
      humidity: openWeatherData.main.humidity,
      windSpeed: openWeatherData.wind.speed,
      icon: openWeatherData.weather[0].icon,
      city: "Las Flores, Buenos Aires",
      source: "OpenWeatherMap",
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Error en la API de clima:", error)

    // Datos de respaldo en caso de error
    return NextResponse.json({
      temperature: 18,
      condition: "Clear",
      description: "Cielo despejado",
      humidity: 65,
      windSpeed: 10,
      icon: "01d",
      city: "Las Flores, Buenos Aires",
      source: "Datos de respaldo",
    })
  }
}
