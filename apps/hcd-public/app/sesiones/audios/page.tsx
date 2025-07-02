import { Button } from "@/components/ui/button"
import { Download, Play } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { getSessionAudios } from "@/actions/session-actions"

export const metadata: Metadata = {
  title: "Audios | HCD Las Flores",
  description: "Audios de las sesiones del Honorable Concejo Deliberante de Las Flores",
}

export default async function AudiosPage() {
  const audios = await getSessionAudios()

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Audios de sesiones</h1>
        <Link href="/sesiones">
          <Button variant="outline">Volver a Sesiones</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <p>
              Aquí puede acceder a los audios completos de las sesiones del Honorable Concejo Deliberante. Puede
              escucharlos en línea o descargarlos para su posterior consulta.
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Audios 2025</h2>
            <select className="p-2 border border-gray-300 rounded-md">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="border-t border-gray-200">
            {audios.map((audio) => (
              <div key={audio.id} className="py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">
                      {new Date(audio.date).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="font-medium">Audio - Sesión {audio.type}</h3>
                  </div>
                  <div className="flex gap-3">
                    <Link href={audio.audioFileUrl!} target="_blank" className="inline-flex items-center text-[#0e4c7d] hover:underline">
                      <Play className="h-4 w-4 mr-1" />
                      Escuchar
                    </Link>
                    <Link href={audio.audioFileUrl!} target="_blank" className="inline-flex items-center text-[#0e4c7d] hover:underline">
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
