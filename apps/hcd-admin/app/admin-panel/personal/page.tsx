import { getAllStaff } from "@/lib/services/staff-service"
import Image from "next/image"
import Link from "next/link"

export default async function PersonalPage() {
  const personal = await getAllStaff()
  // Agrupar por cargo
  const personalPorCargo = personal.reduce<Record<string, typeof personal>>((acc, p) => {
    const cargo = p.position || "Sin cargo"
    if (!acc[cargo]) acc[cargo] = []
    acc[cargo].push(p)
    return acc
  }, {})

  // Mapeo de cargos internos a nombres legibles
  const cargoLegible = (cargo: string) => {
    switch (cargo) {
      case "secretario_hcd":
        return "Secretaria/o H. Concejo Deliberante"
      case "maestranza":
        return "Maestranza"
      case "administrativo":
        return "Administrativo"
      case "secretario_bloque":
        return "Secretario/a de Bloque"
      default:
        return cargo.charAt(0).toUpperCase() + cargo.slice(1)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personal H. Concejo Deliberante</h1>
        <Link href="/admin-panel/personal/nuevo" className="text-blue-600 hover:underline">
          Agregar personal
        </Link>
      </div>
      <div className="space-y-6">
        {Object.entries(personalPorCargo).map(([cargo, personas]) => (
          <div key={cargo}>
            <h2 className="px-4 py-3 font-semibold bg-gray-100 border rounded-t">{cargoLegible(cargo)}</h2>
            <ul className="space-y-2 border-l border-r border-b rounded-b p-2">
              {personas.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center p-4 bg-white shadow rounded border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                >
                  <Link
                    href={`/admin-panel/personal/${p.id}`}
                    className="flex-1 flex items-center space-x-4 min-w-0"
                    prefetch={false}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="w-2 h-10 rounded bg-teal-400" />
                    <div className="flex items-center gap-4 min-w-0">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full" />
                      )}
                      <div className="min-w-0">
                        <p className="text-lg font-semibold truncate">{p.name}</p>
                        {p.blockName && (
                          <p className="text-sm text-gray-500 truncate">{p.blockName}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <Link
                    href={`/admin-panel/personal/${p.id}/eliminar`}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    prefetch={false}
                  >
                    Eliminar
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}