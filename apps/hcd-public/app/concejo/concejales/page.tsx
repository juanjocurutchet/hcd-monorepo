import { getActiveCouncilMembersByBlock, getSecretarioByBlockId } from "@/actions/council-actions"
import type { Metadata } from "next"
import { FichaAutoridad } from "../autoridades/FichaAutoridad"

export const metadata: Metadata = {
  title: "Concejales | HCD Las Flores",
  description: "Listado de concejales del Honorable Concejo Deliberante de Las Flores",
}

type Concejal = {
  id: number
  name: string
  position: string | null
  imageUrl: string | null
  bio: string | null
  mandate: string | null
  blockId: number | null
  blockName: string | null
  blockColor: string | null
  email?: string
  telefono?: string
  facebook?: string
  instagram?: string
  twitter?: string
}

export default async function ConcejalesPage() {
  const concejales: Concejal[] = await getActiveCouncilMembersByBlock()

  const bloques = Array.from(
    concejales.reduce((map, concejal) => {
      const bloque = concejal.blockName ?? "Sin bloque"
      if (!map.has(bloque)) map.set(bloque, [])
      map.get(bloque)?.push(concejal)
      return map
    }, new Map<string, Concejal[]>())
  )

  const bloquesConId = Array.from(
    concejales.reduce((map, concejal) => {
      if (concejal.blockId) map.set(concejal.blockName, concejal.blockId)
      return map
    }, new Map<string, number>())
  )

  const secretariosPromises = bloquesConId.map(async ([bloque, blockId]) => {
    const secretario = await getSecretarioByBlockId(blockId)
    return [bloque, secretario] as const
  })
  const secretariosArr = await Promise.all(secretariosPromises)
  const secretariosMap = new Map(secretariosArr)

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0e4c7d]">Concejales</h1>

      {bloques.map(([bloque, miembros]) => (
        <div key={bloque} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#0e4c7d]">
            {bloque === "Sin bloque" ? bloque : `Bloque ${bloque}`}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {miembros.map((concejal) => (
              <FichaAutoridad
                key={concejal.id}
                autoridad={{
                  id: concejal.id,
                  name: concejal.name,
                  position: concejal.position,
                  email: concejal.email || null,
                  telefono: concejal.telefono || null,
                  facebook: concejal.facebook || null,
                  instagram: concejal.instagram || null,
                  twitter: concejal.twitter || null,
                  blockName: concejal.blockName,
                  imageUrl: concejal.imageUrl,
                  bio: concejal.bio,
                }}
                cargo={concejal.position || "Concejal"}
              />
            ))}
          </div>

          {secretariosMap.get(bloque) && (
            <div className="mt-8 flex justify-center">
              <FichaAutoridad
                autoridad={{
                  id: secretariosMap.get(bloque).id,
                  name: secretariosMap.get(bloque).name,
                  position: "Secretario/a de bloque",
                  email: secretariosMap.get(bloque).email || null,
                  telefono: secretariosMap.get(bloque).telefono || null,
                  facebook: secretariosMap.get(bloque).facebook || null,
                  instagram: secretariosMap.get(bloque).instagram || null,
                  twitter: secretariosMap.get(bloque).twitter || null,
                  blockName: secretariosMap.get(bloque).blockName,
                  imageUrl: secretariosMap.get(bloque).imageUrl,
                  bio: secretariosMap.get(bloque).bio,
                }}
                cargo="Secretario/a de bloque"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
