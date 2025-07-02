import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, MapPin, Clock, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Audiencias Públicas | Concejo Deliberante de Las Flores",
  description: "Información sobre las audiencias públicas organizadas por el Concejo Deliberante de Las Flores",
}

export default function AudienciasPage() {
  // Estos datos serían obtenidos de la base de datos en una implementación real
  const audienciasFuturas = [
    {
      id: 1,
      titulo: "Audiencia Pública sobre Ordenanza de Tránsito",
      fecha: "15/06/2023",
      hora: "10:00 hs",
      lugar: "Salón de Actos del Concejo Deliberante",
      descripcion:
        "Audiencia pública para debatir el proyecto de ordenanza que modifica el Código de Tránsito Municipal.",
      expediente: "HCD-123/2023",
      inscripcion: true,
    },
    {
      id: 2,
      titulo: "Audiencia Pública sobre Presupuesto Municipal 2024",
      fecha: "20/07/2023",
      hora: "18:00 hs",
      lugar: "Teatro Municipal",
      descripcion:
        "Audiencia pública para presentar y debatir el proyecto de Presupuesto Municipal para el ejercicio 2024.",
      expediente: "HCD-145/2023",
      inscripcion: true,
    },
  ]

  const audienciasPasadas = [
    {
      id: 3,
      titulo: "Audiencia Pública sobre Código de Edificación",
      fecha: "10/03/2023",
      hora: "10:00 hs",
      lugar: "Salón de Actos del Concejo Deliberante",
      descripcion:
        "Audiencia pública para debatir el proyecto de ordenanza que modifica el Código de Edificación Municipal.",
      expediente: "HCD-056/2023",
      inscripcion: false,
      acta: "/documentos/acta-audiencia-056-2023.pdf",
      video: "https://www.youtube.com/watch?v=example1",
    },
    {
      id: 4,
      titulo: "Audiencia Pública sobre Tarifas de Servicios Públicos",
      fecha: "15/02/2023",
      hora: "18:00 hs",
      lugar: "Teatro Municipal",
      descripcion:
        "Audiencia pública para debatir el proyecto de ordenanza que establece las tarifas de servicios públicos para el año 2023.",
      expediente: "HCD-032/2023",
      inscripcion: false,
      acta: "/documentos/acta-audiencia-032-2023.pdf",
      video: "https://www.youtube.com/watch?v=example2",
    },
    {
      id: 5,
      titulo: "Audiencia Pública sobre Plan de Desarrollo Urbano",
      fecha: "20/11/2022",
      hora: "10:00 hs",
      lugar: "Salón de Actos del Concejo Deliberante",
      descripcion:
        "Audiencia pública para debatir el proyecto de ordenanza que aprueba el Plan de Desarrollo Urbano 2023-2033.",
      expediente: "HCD-245/2022",
      inscripcion: false,
      acta: "/documentos/acta-audiencia-245-2022.pdf",
      video: "https://www.youtube.com/watch?v=example3",
    },
  ]

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Audiencias Públicas</h1>

      <p className="mb-8 text-gray-700">
        Las audiencias públicas son instancias de participación ciudadana en el proceso de toma de decisiones del
        Concejo Deliberante. En ellas, los vecinos pueden expresar su opinión sobre proyectos de ordenanza y otros temas
        de interés público.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
          Próximas Audiencias Públicas
        </h2>

        {audienciasFuturas.length > 0 ? (
          <div className="space-y-6">
            {audienciasFuturas.map((audiencia) => (
              <div
                key={audiencia.id}
                className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-xl font-bold text-[#0e4c7d] mb-2">{audiencia.titulo}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-[#0a3d68] mr-2" />
                    <span>{audiencia.fecha}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-[#0a3d68] mr-2" />
                    <span>{audiencia.hora}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#0a3d68] mr-2" />
                    <span>{audiencia.lugar}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-[#0a3d68] mr-2" />
                    <span>Expediente: {audiencia.expediente}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{audiencia.descripcion}</p>

                {audiencia.inscripcion && (
                  <Link
                    href={`/concejo/audiencias/${audiencia.id}/inscripcion`}
                    className="inline-block bg-[#0e4c7d] text-white py-2 px-4 rounded hover:bg-[#0a3d68] transition-colors mr-4"
                  >
                    Inscribirse para participar
                  </Link>
                )}

                <Link
                  href={`/concejo/audiencias/${audiencia.id}`}
                  className="inline-block bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Más información
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">No hay audiencias públicas programadas en este momento.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
          Audiencias Públicas Realizadas
        </h2>

        <div className="space-y-6">
          {audienciasPasadas.map((audiencia) => (
            <div
              key={audiencia.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-bold text-[#0e4c7d] mb-2">{audiencia.titulo}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#0a3d68] mr-2" />
                  <span>{audiencia.fecha}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#0a3d68] mr-2" />
                  <span>{audiencia.hora}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-[#0a3d68] mr-2" />
                  <span>{audiencia.lugar}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-[#0a3d68] mr-2" />
                  <span>Expediente: {audiencia.expediente}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{audiencia.descripcion}</p>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={audiencia.acta}
                  className="inline-block bg-[#0e4c7d] text-white py-2 px-4 rounded hover:bg-[#0a3d68] transition-colors"
                  target="_blank"
                >
                  Descargar Acta
                </Link>

                <Link
                  href={audiencia.video}
                  className="inline-block bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                  target="_blank"
                >
                  Ver Video
                </Link>

                <Link
                  href={`/concejo/audiencias/${audiencia.id}`}
                  className="inline-block bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Más información
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
