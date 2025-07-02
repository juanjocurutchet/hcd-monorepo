import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Concejales Anteriores | Concejo Deliberante de Las Flores",
  description: "Listado histórico de concejales que formaron parte del Concejo Deliberante de Las Flores",
}

export default function ConcejalesAnterioresPage() {
  // Estos datos serían obtenidos de la base de datos en una implementación real
  const periodos = [
    {
      id: 1,
      periodo: "2019-2023",
      concejales: [
        { id: 1, nombre: "Juan Pérez", bloque: "Frente de Todos", imagen: "/diverse-group.png" },
        { id: 2, nombre: "María González", bloque: "Frente de Todos", imagen: "/diverse-group.png" },
        { id: 3, nombre: "Carlos Rodríguez", bloque: "Juntos por el Cambio", imagen: "/diverse-group.png" },
        { id: 4, nombre: "Ana López", bloque: "Juntos por el Cambio", imagen: "/diverse-group.png" },
        { id: 5, nombre: "Pedro Sánchez", bloque: "Consenso Federal", imagen: "/diverse-group.png" },
        { id: 6, nombre: "Lucía García", bloque: "Frente de Todos", imagen: "/diverse-group.png" },
      ],
    },
    {
      id: 2,
      periodo: "2015-2019",
      concejales: [
        { id: 7, nombre: "Roberto Fernández", bloque: "Frente para la Victoria", imagen: "/diverse-group.png" },
        { id: 8, nombre: "Silvia Martínez", bloque: "Frente para la Victoria", imagen: "/diverse-group.png" },
        { id: 9, nombre: "Miguel Ángel López", bloque: "Cambiemos", imagen: "/diverse-group.png" },
        { id: 10, nombre: "Carolina Gómez", bloque: "Cambiemos", imagen: "/diverse-group.png" },
        { id: 11, nombre: "Javier Rodríguez", bloque: "Frente Renovador", imagen: "/diverse-group.png" },
        { id: 12, nombre: "Marcela Pérez", bloque: "Frente para la Victoria", imagen: "/diverse-group.png" },
      ],
    },
    {
      id: 3,
      periodo: "2011-2015",
      concejales: [
        {
          id: 13,
          nombre: "Alberto Gutiérrez",
          bloque: "Frente para la Victoria",
          imagen: "/diverse-group.png",
        },
        { id: 14, nombre: "Marta Sánchez", bloque: "Frente para la Victoria", imagen: "/diverse-group.png" },
        { id: 15, nombre: "Ricardo Gómez", bloque: "Unión Cívica Radical", imagen: "/diverse-group.png" },
        { id: 16, nombre: "Susana Martínez", bloque: "Unión Cívica Radical", imagen: "/diverse-group.png" },
        {
          id: 17,
          nombre: "Jorge Fernández",
          bloque: "Frente Amplio Progresista",
          imagen: "/diverse-group.png",
        },
        { id: 18, nombre: "Laura Rodríguez", bloque: "Frente para la Victoria", imagen: "/diverse-group.png" },
      ],
    },
  ]

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Concejales Anteriores</h1>

      <p className="mb-8 text-gray-700">
        A lo largo de la historia democrática de Las Flores, numerosos vecinos han tenido el honor de representar a la
        comunidad en el Concejo Deliberante. Esta sección rinde homenaje a quienes han formado parte de esta institución
        en períodos anteriores.
      </p>

      <div className="space-y-12">
        {periodos.map((periodo) => (
          <div key={periodo.id}>
            <h2 className="text-2xl font-bold text-[#0a3d68] mb-6 pb-2 border-b-2 border-[#0a3d68]">
              Período {periodo.periodo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {periodo.concejales.map((concejal) => (
                <div
                  key={concejal.id}
                  className="flex flex-col items-center p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={concejal.imagen || "/placeholder.svg"}
                      alt={concejal.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-center">{concejal.nombre}</h3>
                  <p className="text-gray-600 text-center">{concejal.bloque}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
