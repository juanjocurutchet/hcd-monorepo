import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Archivo Histórico | Honorable Concejo Deliberante de Las Flores",
  description:
    "Archivo histórico del Honorable Concejo Deliberante de Las Flores, documentos históricos y patrimonio legislativo",
}

export default function ArchivoHistoricoPage() {
  // Datos de ejemplo para los documentos históricos
  const documentosHistoricos = [
    {
      id: 1,
      titulo: "Acta de Constitución del Primer Concejo Deliberante",
      fecha: "15 de junio de 1856",
      descripcion: "Documento original de la constitución del primer Concejo Deliberante de Las Flores.",
      categoria: "Actas Fundacionales",
    },
    {
      id: 2,
      titulo: "Primera Ordenanza Municipal",
      fecha: "20 de junio de 1856",
      descripcion: "Primera ordenanza aprobada por el Concejo Deliberante relacionada con la organización urbana.",
      categoria: "Ordenanzas Históricas",
    },
    {
      id: 3,
      titulo: "Declaración de Las Flores como Ciudad",
      fecha: "10 de mayo de 1894",
      descripcion: "Documento histórico donde se declara a Las Flores como ciudad.",
      categoria: "Declaraciones",
    },
  ]

  // Datos de ejemplo para las fotografías históricas
  const fotografiasHistoricas = [
    {
      id: 1,
      titulo: "Primer edificio del Concejo Deliberante",
      fecha: "1890",
      descripcion: "Fotografía del primer edificio donde funcionó el Concejo Deliberante.",
    },
    {
      id: 2,
      titulo: "Sesión inaugural del Concejo Deliberante",
      fecha: "1910",
      descripcion: "Fotografía de la sesión inaugural del Concejo Deliberante en su nuevo edificio.",
    },
    {
      id: 3,
      titulo: "Visita del Gobernador Provincial",
      fecha: "1925",
      descripcion: "Fotografía de la visita del Gobernador Provincial al Concejo Deliberante.",
    },
  ]

  // Datos de ejemplo para los presidentes históricos
  const presidentesHistoricos = [
    {
      id: 1,
      nombre: "Juan Martínez",
      periodo: "1856-1858",
      descripcion: "Primer presidente del Concejo Deliberante de Las Flores.",
    },
    {
      id: 2,
      nombre: "Pedro Rodríguez",
      periodo: "1858-1860",
      descripcion: "Segundo presidente del Concejo Deliberante, impulsó las primeras ordenanzas de urbanización.",
    },
    {
      id: 3,
      nombre: "Carlos López",
      periodo: "1860-1862",
      descripcion: "Tercer presidente del Concejo Deliberante, destacado por su labor en educación.",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Archivo Histórico</h1>

        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Documentos Históricos</h2>
            <div className="bg-gray-100 p-6 rounded-lg">
              <p className="mb-4">
                El Archivo Histórico del Honorable Concejo Deliberante de Las Flores conserva documentos de gran valor
                histórico que reflejan la evolución institucional y política de nuestra ciudad desde su fundación.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {documentosHistoricos.map((documento) => (
                  <div key={documento.id} className="bg-white p-4 rounded shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{documento.fecha}</span>
                      <span className="bg-[#29ABE2] text-white text-xs px-2 py-1 rounded">{documento.categoria}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{documento.titulo}</h3>
                    <p className="text-sm text-gray-700 mb-3">{documento.descripcion}</p>
                    <Link
                      href="#"
                      className="text-[#29ABE2] hover:text-[#1D8BB7] text-sm font-medium flex items-center"
                    >
                      Ver documento
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link href="#" className="inline-block bg-[#29ABE2] hover:bg-[#1D8BB7] text-white px-4 py-2 rounded">
                  Ver todos los documentos históricos
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Fotografías Históricas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fotografiasHistoricas.map((foto) => (
                <div key={foto.id} className="border rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-48 bg-gray-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500">Imagen histórica</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-sm mb-1">{foto.fecha}</p>
                    <h3 className="font-semibold mb-2">{foto.titulo}</h3>
                    <p className="text-sm text-gray-700">{foto.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Presidentes Históricos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-100 text-left border-b">Nombre</th>
                    <th className="py-3 px-4 bg-gray-100 text-left border-b">Período</th>
                    <th className="py-3 px-4 bg-gray-100 text-left border-b">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {presidentesHistoricos.map((presidente) => (
                    <tr key={presidente.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{presidente.nombre}</td>
                      <td className="py-3 px-4 border-b">{presidente.periodo}</td>
                      <td className="py-3 px-4 border-b">{presidente.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link href="#" className="inline-block bg-[#29ABE2] hover:bg-[#1D8BB7] text-white px-4 py-2 rounded">
                Ver lista completa
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Línea de Tiempo</h2>
            <div className="relative border-l-4 border-[#29ABE2] pl-6 py-4 ml-6">
              <div className="mb-8 relative">
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#29ABE2]"></div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">1856</h3>
                  <p>Fundación del Honorable Concejo Deliberante de Las Flores</p>
                </div>
              </div>
              <div className="mb-8 relative">
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#29ABE2]"></div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">1894</h3>
                  <p>Las Flores es declarada ciudad</p>
                </div>
              </div>
              <div className="mb-8 relative">
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#29ABE2]"></div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">1910</h3>
                  <p>Inauguración del nuevo edificio del Concejo Deliberante</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-[#29ABE2]"></div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold">1956</h3>
                  <p>Centenario del Honorable Concejo Deliberante</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
