import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { getSessionAgendas } from "@/actions/session-actions"

export const metadata: Metadata = {
  title: "Órdenes del día | HCD Las Flores",
  description: "Órdenes del día de las sesiones del Honorable Concejo Deliberante de Las Flores",
}

export default async function OrdenesPage() {
  const ordenes = await getSessionAgendas()

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Órdenes del día</h1>
        <Link href="/sesiones">
          <Button variant="outline">Volver a Sesiones</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <p>
              Las órdenes del día contienen los asuntos a tratar en cada sesión del Honorable Concejo Deliberante. Aquí
              puede consultar y descargar las órdenes del día de las sesiones realizadas.
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Órdenes del día 2025</h2>
            <select className="p-2 border border-gray-300 rounded-md">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="border-t border-gray-200">
            {ordenes.map((orden) => (
              <div key={orden.id} className="py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">
                      {new Date(orden.date).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="font-medium">Orden del día - Sesión {orden.type.charAt(0).toUpperCase() + orden.type.slice(1)}</h3>
                  </div>
                  <div>
                    <Link
                      href={orden.agendaFileUrl ?? "#"}
                      className="inline-flex items-center text-[#0e4c7d] hover:underline"
                      target="_blank"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
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
