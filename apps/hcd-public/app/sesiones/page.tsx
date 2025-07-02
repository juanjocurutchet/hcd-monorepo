import { getLatestSessions } from "@/actions/session-actions"
import { Button } from "@/components/ui/button"
import { Download, Video } from "lucide-react"
import { SiYoutube } from "react-icons/si"
import Link from "next/link"

export default async function SesionesPage() {
  const sesiones = await getLatestSessions()

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sesiones</h1>

          <div className="flex items-center gap-4">
            <select className="p-2 border border-gray-300 rounded-md">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>

            <Link href="/sesiones/transmisiones">
              <Button className="bg-[#f39c12] hover:bg-[#e67e22] text-white flex items-center gap-2">
                <Video className="h-4 w-4" />
                Transmisión en vivo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="border-t border-b border-gray-300 py-4">
              {sesiones.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No hay sesiones disponibles</div>
              ) : (
                sesiones.map((sesion) => (
                  <div key={sesion.id} className="py-4 border-b last:border-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <p className="text-gray-500">
                          {new Date(sesion.date).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <h3 className="font-medium">
                          Sesión {sesion.type.charAt(0).toUpperCase() + sesion.type.slice(1)}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
                        {sesion.minutesFileUrl && (
                          <Link
                            href={sesion.minutesFileUrl}
                            className="flex items-center text-[#0e4c7d] hover:underline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar acta
                          </Link>
                        )}
                        {sesion.videoUrl && (
                          <Link
                            href={sesion.videoUrl}
                            target="_blank"
                            className="flex items-center text-red-600 hover:underline"
                          >
                            <SiYoutube className="h-4 w-4 mr-1" />
                            Ver en YouTube
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-800 text-white p-3 mb-2">
              <h3 className="font-medium">¿Cómo se clasifican las sesiones?</h3>
            </div>

            <div className="bg-[#29ABE2] text-white p-4">
              <div className="mb-4">
                <h4 className="font-bold mb-1">Preparatoria</h4>
                <p className="text-sm">
                  En la fecha fijada por la Junta Electoral, para cumplir lo dispuesto en los artículos 18 al 23 de la
                  Ley Orgánica de las Municipalidades.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold mb-1">Ordinarias</h4>
                <p className="text-sm">
                  El Honorable Concejo Deliberante por propia determinación abrirá sus Sesiones Ordinarias el 1° de
                  abril de cada año y las cerrará el 30 de noviembre. Se trata del período dentro del cual el concejo
                  ejerce en plenitud sus atribuciones. Tienen fecha de inicio y de finalización. La apertura de este
                  período suele ser celebrada con la presencia y un informe o memoria del titular del Ejecutivo.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold mb-1">De Prórroga</h4>
                <p className="text-sm">
                  El Concejo Deliberante podrá prorrogar las Sesiones Ordinarias por el término de treinta (30) días.
                  Constituyen una extensión del período ordinario, de modo que el Concejo ejerce en este lapso su
                  competencia en plenitud. Al igual que las sesiones ordinarias tienen fechas de inicio y de
                  finalización ligadas al momento de su convocatoria.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-1">Especiales</h4>
                <p className="text-sm">
                  Las que determine el Cuerpo dentro del período de sesiones ordinarias y de prórroga, y las que deberá
                  realizar en el mes de marzo por propia determinación, para tratar el examen de las cuentas, previsto
                  en el artículo 192 inciso 5°(f), de la Constitución.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
