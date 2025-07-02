"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const slides = [
  {
    id: 1,
    image: "/concejo-deliberante-sesion.png",
    title: "Aprobaron ordenanza sobre gestión de residuos",
    description:
      "El Concejo Deliberante aprobó por unanimidad una nueva ordenanza que regula la gestión integral de residuos sólidos urbanos en el municipio.",
    link: "/noticias/1",
  },
  {
    id: 2,
    image: "/concejo-deliberante-votacion.png",
    title: "Solicitan nueva defensoría civil",
    description:
      "Las Flores, con más de 25.000 habitantes, enfrenta una creciente demanda en servicios legales que ha llevado a la necesidad urgente de una segunda Defensoría Civil.",
    link: "/noticias/2",
  },
]

export default function NewsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-[#0e4c7d]/80 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
              <p className="mb-0">{slide.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
        aria-label="Anterior"
      >
        &lt;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
        aria-label="Siguiente"
      >
        &gt;
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index === currentSlide ? "bg-white text-[#0e4c7d]" : "bg-[#0e4c7d]/50 text-white"
            }`}
            aria-label={`Ir a diapositiva ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}