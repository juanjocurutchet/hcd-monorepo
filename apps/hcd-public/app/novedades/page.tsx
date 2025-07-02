import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novedades | Honorable Concejo Deliberante de Las Flores",
  description: "Últimas noticias, eventos y actividades del Honorable Concejo Deliberante de Las Flores",
}

export default function NovedadesPage() {
  // Datos de ejemplo para las noticias
  const noticias = [
    {
      id: 1,
      titulo: "Sesión Ordinaria aprueba nuevas ordenanzas municipales",
      fecha: "15 de mayo de 2025",
      resumen:
        "El Concejo Deliberante aprobó por unanimidad tres nuevas ordenanzas relacionadas con el desarrollo urbano y la protección ambiental.",
      imagen: "/council-session.png",
      categoria: "Sesiones",
    },
    {
      id: 2,
      titulo: "Audiencia pública sobre el presupuesto municipal 2026",
      fecha: "10 de mayo de 2025",
      resumen:
        "Se llevó a cabo la audiencia pública para discutir el presupuesto municipal del próximo año con amplia participación ciudadana.",
      imagen: "/city-anniversary.png",
      categoria: "Audiencias",
    },
    {
      id: 3,
      titulo: "Reconocimiento a deportistas locales",
      fecha: "5 de mayo de 2025",
      resumen:
        "El Concejo Deliberante realizó un acto de reconocimiento a deportistas destacados de nuestra ciudad por sus logros nacionales.",
      imagen: "/athletes-recognition.png",
      categoria: "Eventos",
    },
    {
      id: 4,
      titulo: "Visita de escuelas al Concejo Deliberante",
      fecha: "28 de abril de 2025",
      resumen:
        "Estudiantes de escuelas primarias visitaron el Concejo Deliberante como parte del programa de educación cívica.",
      imagen: "/school-visit-council.png",
      categoria: "Educación",
    },
    {
      id: 5,
      titulo: "Nueva comisión de Desarrollo Económico",
      fecha: "20 de abril de 2025",
      resumen:
        "Se conformó la nueva comisión de Desarrollo Económico que trabajará en proyectos para impulsar la economía local.",
      imagen: "/political-group.png",
      categoria: "Institucional",
    },
    {
      id: 6,
      titulo: "Jornada de capacitación sobre transparencia legislativa",
      fecha: "15 de abril de 2025",
      resumen:
        "Concejales y personal del HCD participaron de una jornada de capacitación sobre transparencia y acceso a la información pública.",
      imagen: "/diverse-group.png",
      categoria: "Capacitación",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Novedades</h1>

        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <div key={noticia.id} className="border rounded-lg overflow-hidden shadow-md">
                <div className="relative h-48">
                  <Image
                    src={noticia.imagen || "/placeholder.svg"}
                    alt={noticia.titulo}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-[#29ABE2] text-white px-3 py-1 text-sm">
                    {noticia.categoria}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-sm mb-2">{noticia.fecha}</p>
                  <h2 className="text-xl font-semibold mb-2">{noticia.titulo}</h2>
                  <p className="text-gray-700 mb-4">{noticia.resumen}</p>
                  <Link
                    href={`/noticias/${noticia.id}`}
                    className="inline-block bg-[#29ABE2] hover:bg-[#1D8BB7] text-white px-4 py-2 rounded"
                  >
                    Leer más
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <nav aria-label="Paginación">
            <ul className="flex space-x-2">
              <li>
                <span className="px-4 py-2 bg-[#29ABE2] text-white rounded">1</span>
              </li>
              <li>
                <Link href="#" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                  2
                </Link>
              </li>
              <li>
                <Link href="#" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                  3
                </Link>
              </li>
              <li>
                <Link href="#" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                  Siguiente
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}
