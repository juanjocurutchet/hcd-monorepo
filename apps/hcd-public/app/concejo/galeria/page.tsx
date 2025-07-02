import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Galería de Fotos | Concejo Deliberante de Las Flores",
  description: "Galería fotográfica de eventos, sesiones y actividades del Concejo Deliberante de Las Flores",
}

export default function GaleriaPage() {
  // Estos datos serían obtenidos de la base de datos en una implementación real
  const categorias = [
    {
      id: 1,
      nombre: "Sesiones Ordinarias",
      fotos: [
        { id: 1, titulo: "Sesión Ordinaria Mayo 2023", fecha: "15/05/2023", imagen: "/concejo-deliberante-sesion.png" },
        {
          id: 2,
          titulo: "Sesión Ordinaria Abril 2023",
          fecha: "20/04/2023",
          imagen: "/concejo-deliberante-votacion.png",
        },
        { id: 3, titulo: "Sesión Ordinaria Marzo 2023", fecha: "15/03/2023", imagen: "/council-session.png" },
      ],
    },
    {
      id: 2,
      nombre: "Sesiones Especiales",
      fotos: [
        { id: 4, titulo: "Apertura de Sesiones 2023", fecha: "01/03/2023", imagen: "/council-opening.png" },
        {
          id: 5,
          titulo: "Sesión Especial por Aniversario de la Ciudad",
          fecha: "17/07/2022",
          imagen: "/city-anniversary.png",
        },
      ],
    },
    {
      id: 3,
      nombre: "Eventos Institucionales",
      fotos: [
        {
          id: 6,
          titulo: "Visita de Escuelas al Concejo",
          fecha: "10/06/2023",
          imagen: "/school-visit-council.png",
        },
        {
          id: 7,
          titulo: "Reconocimiento a Deportistas Locales",
          fecha: "25/05/2023",
          imagen: "/athletes-recognition.png",
        },
        {
          id: 8,
          titulo: "Firma de Convenio con Universidad",
          fecha: "12/04/2023",
          imagen: "/placeholder.svg?height=300&width=400&query=university+agreement+signing",
        },
      ],
    },
  ]

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Galería de Fotos</h1>

      <p className="mb-8 text-gray-700">
        Bienvenido a la galería fotográfica del Concejo Deliberante de Las Flores. Aquí podrá encontrar imágenes de las
        sesiones, eventos institucionales y actividades realizadas por el cuerpo legislativo.
      </p>

      <div className="space-y-12">
        {categorias.map((categoria) => (
          <div key={categoria.id}>
            <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
              {categoria.nombre}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="group border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={foto.imagen || "/placeholder.svg"}
                      alt={foto.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{foto.titulo}</h3>
                    <p className="text-gray-600">{foto.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
