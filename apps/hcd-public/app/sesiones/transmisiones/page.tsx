import { Button } from "@/components/ui/button"
import { Youtube } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transmisiones en vivo | HCD Las Flores",
  description: "Transmisiones en vivo de las sesiones del Honorable Concejo Deliberante de Las Flores",
}

export default function TransmisionesPage() {
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transmisiones en vivo</h1>
        <Link href="/sesiones">
          <Button variant="outline">Volver a Sesiones</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Sesión en vivo</h2>
            <p className="mb-6">
              Las sesiones del Honorable Concejo Deliberante de Las Flores son transmitidas en vivo a través de nuestro
              canal oficial de YouTube. Haga clic en el botón de abajo para acceder a la transmisión en vivo.
            </p>
            <div className="flex justify-center mb-6">
              <Link
                href="https://www.youtube.com/channel/UCRVvtXaJETjQvbqUVvOkZAQ"
                target="_blank"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <Youtube className="mr-2 h-6 w-6" />
                Ver transmisión en YouTube
              </Link>
            </div>
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image src="/diverse-group.png" alt="Sesión del Concejo Deliberante" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Link
                  href="https://www.youtube.com/channel/UCRVvtXaJETjQvbqUVvOkZAQ"
                  target="_blank"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
                >
                  <Youtube className="h-12 w-12" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Próximas sesiones</h2>
            <div className="border-t border-gray-200">
              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Jueves, 30 de mayo de 2025 - 19:00 hs</p>
                    <h3 className="font-medium">Sesión Ordinaria</h3>
                  </div>
                  <div>
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                      Próximamente
                    </span>
                  </div>
                </div>
              </div>
              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Jueves, 13 de junio de 2025 - 19:00 hs</p>
                    <h3 className="font-medium">Sesión Ordinaria</h3>
                  </div>
                  <div>
                    <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      Programada
                    </span>
                  </div>
                </div>
              </div>
              <div className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500">Jueves, 27 de junio de 2025 - 19:00 hs</p>
                    <h3 className="font-medium">Sesión Ordinaria</h3>
                  </div>
                  <div>
                    <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      Programada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
