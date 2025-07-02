"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getNewsForSlider, News } from "@/actions/news-actions"


export default function NewsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        const newsData = await getNewsForSlider(3)
        setSlides(newsData)
      } catch (error) {
        console.error("Error loading news for slider:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  if (loading) {
    return (
      <div className="relative h-[400px] bg-gray-200 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Cargando noticias...</p>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-[400px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No hay noticias disponibles</p>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative h-full">
            <Image
              src={slide.image_url || "/placeholder.svg?height=400&width=800"}
              alt={slide.title}
              fill
              style={{ objectFit: "cover" }}
              priority={index === 0}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-[#0e4c7d]/80 text-white p-6">
              <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm md:text-base">{slide.excerpt || slide.content.substring(0, 150) + "..."}</p>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-24 left-0 right-0 flex justify-center space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-8 h-1 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
