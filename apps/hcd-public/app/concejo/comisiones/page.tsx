import { getAllCommissions } from "@/actions/council-actions"
import type { Metadata } from "next"
import { ComisionAcordeon } from "./components/comision-acordeon"

export const metadata: Metadata = {
  title: "Comisiones Internas | Concejo Deliberante de Las Flores",
  description: "Conoce las comisiones internas del Concejo Deliberante de Las Flores y sus integrantes.",
}

export default async function ComisionesPage() {
  const comisiones = await getAllCommissions()

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Comisiones Internas</h1>
      <p className="mb-8 text-gray-700">
        Las comisiones internas son grupos de trabajo especializados que estudian los proyectos presentados en el
        Concejo Deliberante antes de su tratamiento en el recinto. Cada comisión está integrada por concejales de los
        distintos bloques políticos y se especializa en un área temática específica.
      </p>
      <div className="space-y-6">
        {comisiones.map((comision) => (
          <ComisionAcordeon key={comision.id} comision={comision} />
        ))}
      </div>
    </main>
  )
}
