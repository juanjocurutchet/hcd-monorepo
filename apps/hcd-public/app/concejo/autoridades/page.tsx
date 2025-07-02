import { getAuthorities, getSecretarioHCD } from "@/actions/council-actions"
import type { Metadata } from "next"
import { Autoridad as AutoridadType, FichaAutoridad } from "./FichaAutoridad"

export const metadata: Metadata = {
  title: "Autoridades | HCD Las Flores",
  description: "Autoridades del Honorable Concejo Deliberante de Las Flores",
}

type Autoridad = AutoridadType

export default async function AutoridadesPage() {
  const autoridades: Autoridad[] = await getAuthorities()
  const secretarioHCD = await getSecretarioHCD()

  // Mapeo de cargos internos a nombres legibles
  const cargoLegible = (seniorPosition: string | null | undefined) => {
    switch (seniorPosition) {
      case "presidente_hcd":
        return "Presidente - H. Concejo Deliberante"
      case "vicepresidente1_hcd":
        return "Vicepresidente 1° - H. Concejo Deliberante"
      case "vicepresidente2_hcd":
        return "Vicepresidente 2° - H. Concejo Deliberante"
      default:
        return seniorPosition || ""
    }
  }

  const presidente = autoridades.find(a => a.seniorPosition === "presidente_hcd")
  const vicepresidente1 = autoridades.find(a => a.seniorPosition === "vicepresidente1_hcd")
  const vicepresidente2 = autoridades.find(a => a.seniorPosition === "vicepresidente2_hcd")

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0e4c7d]">Autoridades del H. Concejo Deliberante</h1>
      <div className="bg-white shadow-md rounded-lg p-8 flex flex-col items-center">
        {/* Presidente */}
        {presidente && <FichaAutoridad autoridad={presidente} cargo={cargoLegible(presidente.seniorPosition)} />}
        {/* Vicepresidentes */}
        <div className="flex flex-col md:flex-row justify-center gap-8 w-full mb-8">
          {vicepresidente1 && <FichaAutoridad autoridad={vicepresidente1} cargo={cargoLegible(vicepresidente1.seniorPosition)} />}
          {vicepresidente2 && <FichaAutoridad autoridad={vicepresidente2} cargo={cargoLegible(vicepresidente2.seniorPosition)} />}
        </div>
        {/* Secretario/a */}
        {secretarioHCD && <FichaAutoridad autoridad={secretarioHCD} cargo="Secretario/a - H. Concejo Deliberante" />}
      </div>
    </div>
  )
}
