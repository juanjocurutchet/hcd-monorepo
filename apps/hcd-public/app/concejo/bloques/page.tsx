import { getAllPoliticalBlocksWithPresident, getCouncilMembersByBlock, getSecretarioByBlockId } from "@/actions/council-actions"
import type { Metadata } from "next"
import BloquesAccordion from "./BloquesAccordion"

export const metadata: Metadata = {
  title: "Bloques Políticos | Concejo Deliberante de Las Flores",
  description: "Información sobre los bloques políticos que conforman el Concejo Deliberante de Las Flores",
}

export default async function BloquesPage() {
  const bloques = await getAllPoliticalBlocksWithPresident()
  const bloquesConConcejales = await Promise.all(
    bloques.map(async (bloque) => {
      const concejales = await getCouncilMembersByBlock(bloque.id)
      let concejalesOrdenados = concejales
      if (bloque.president && bloque.president.id) {
        concejalesOrdenados = [
          ...concejales.filter(c => c.id === bloque.president.id),
          ...concejales.filter(c => c.id !== bloque.president.id),
        ]
      }
      const secretario = await getSecretarioByBlockId(bloque.id)
      return { ...bloque, concejales: concejalesOrdenados, secretario }
    })
  )
  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[#0e4c7d] mb-6">Bloques Políticos</h1>
      <p className="mb-8 text-gray-700">
        El Concejo Deliberante de Las Flores está compuesto por diferentes bloques políticos que representan a los
        partidos y coaliciones que obtuvieron representación en las elecciones. Cada bloque tiene un presidente que
        coordina la actividad legislativa de sus integrantes.
      </p>
      <BloquesAccordion bloques={bloquesConConcejales} />
    </main>
  )
}
