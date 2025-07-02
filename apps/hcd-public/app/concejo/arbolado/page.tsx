import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { FileText, Download, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Arbolado Público | Concejo Deliberante de Las Flores",
  description:
    "Información sobre la ordenanza de arbolado público y acciones para la preservación del patrimonio arbóreo de Las Flores",
}

export default function ArboladoPage() {
  // Estos datos serían obtenidos de la base de datos en una implementación real
  const documentos = [
    {
      id: 1,
      titulo: "Ordenanza de Arbolado Público N° 3456/2022",
      descripcion:
        "Establece el régimen de protección, conservación, manejo y desarrollo del arbolado público en el Partido de Las Flores.",
      fecha: "15/06/2022",
      archivo: "/documentos/ordenanza-arbolado-3456-2022.pdf",
    },
    {
      id: 2,
      titulo: "Plan Maestro de Arbolado Urbano 2022-2032",
      descripcion:
        "Documento que establece los lineamientos para la gestión del arbolado urbano en la ciudad de Las Flores para los próximos 10 años.",
      fecha: "20/07/2022",
      archivo: "/documentos/plan-maestro-arbolado-2022-2032.pdf",
    },
    {
      id: 3,
      titulo: "Guía de Especies Recomendadas",
      descripcion:
        "Catálogo de especies arbóreas recomendadas para la plantación en veredas y espacios públicos de Las Flores.",
      fecha: "10/08/2022",
      archivo: "/documentos/guia-especies-arbolado.pdf",
    },
  ]

  const actividades = [
    {
      id: 1,
      titulo: "Programa 'Un Árbol por Vecino'",
      descripcion:
        "Iniciativa que promueve la participación ciudadana en la plantación y cuidado de árboles en el espacio público.",
      imagen: "/placeholder.svg?height=300&width=400&query=tree+planting",
      enlace: "/concejo/arbolado/programas/un-arbol-por-vecino",
    },
    {
      id: 2,
      titulo: "Censo de Arbolado Urbano",
      descripcion:
        "Relevamiento de todos los ejemplares arbóreos de la ciudad para conocer su estado y planificar acciones de mantenimiento y reposición.",
      imagen: "/placeholder.svg?height=300&width=400&query=tree+census",
      enlace: "/concejo/arbolado/censo",
    },
    {
      id: 3,
      titulo: "Jornadas de Concientización",
      descripcion:
        "Actividades educativas dirigidas a escuelas y público en general sobre la importancia del arbolado urbano.",
      imagen: "/placeholder.svg?height=300&width=400&query=environmental+education",
      enlace: "/concejo/arbolado/jornadas",
    },
  ]

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Arbolado Público</h1>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
        <p className="text-green-800">
          El Concejo Deliberante de Las Flores promueve la protección y el desarrollo del arbolado público como
          patrimonio natural y cultural de nuestra ciudad, reconociendo su importancia para la calidad ambiental, la
          salud y el bienestar de los vecinos.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">Marco Normativo</h2>

        <div className="space-y-6">
          {documentos.map((documento) => (
            <div
              key={documento.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start">
                <FileText className="h-8 w-8 text-[#0e4c7d] mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-[#0e4c7d] mb-2">{documento.titulo}</h3>
                  <p className="text-gray-600 mb-1">Fecha: {documento.fecha}</p>
                  <p className="text-gray-700 mb-4">{documento.descripcion}</p>

                  <Link
                    href={documento.archivo}
                    className="inline-flex items-center bg-[#0e4c7d] text-white py-2 px-4 rounded hover:bg-[#0a3d68] transition-colors"
                    target="_blank"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar documento
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
          Programas y Actividades
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actividades.map((actividad) => (
            <div
              key={actividad.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={actividad.imagen || "/placeholder.svg"}
                  alt={actividad.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#0e4c7d] mb-2">{actividad.titulo}</h3>
                <p className="text-gray-700 mb-4">{actividad.descripcion}</p>

                <Link
                  href={actividad.enlace}
                  className="inline-flex items-center text-[#0e4c7d] hover:text-[#0a3d68] transition-colors"
                >
                  <span className="mr-1">Más información</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
          ¿Cómo puedo participar?
        </h2>

        <div className="bg-white border rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">
            Los vecinos de Las Flores pueden participar activamente en la protección y desarrollo del arbolado público
            de diversas maneras:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>Solicitando la plantación de árboles en la vereda de su domicilio.</li>
            <li>Participando en las jornadas de plantación organizadas por el municipio.</li>
            <li>Cuidando los ejemplares existentes en la vía pública.</li>
            <li>Denunciando podas o talas no autorizadas.</li>
            <li>Participando en las audiencias públicas sobre temas ambientales.</li>
          </ul>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/contacto?asunto=Arbolado"
              className="inline-block bg-[#0e4c7d] text-white py-2 px-4 rounded hover:bg-[#0a3d68] transition-colors"
            >
              Contactar al área de Arbolado
            </Link>

            <Link
              href="/concejo/arbolado/solicitud"
              className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Solicitar plantación de árboles
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
