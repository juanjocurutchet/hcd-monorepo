import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getLatestActivities } from "@/actions/activiity-actions"

export default async function CouncilActivity() {
  const activities = await getLatestActivities(4)

  return (
    <div className="bg-[#f5f5f5] p-4 rounded-md">
      <h2 className="text-lg font-bold text-white bg-[#0e4c7d] p-3 -mx-4 -mt-4 mb-4 rounded-t-md">
        Actividad de los concejales
      </h2>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay actividades recientes</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="border-b border-gray-300 pb-2 last:border-0">
              <Link href={`/actividades/${activity.id}`} className="hover:text-[#0e4c7d]">
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        className="w-full mt-4 border-[#0e4c7d] text-[#0e4c7d] hover:bg-[#0e4c7d] hover:text-white"
      >
        Ver todas las actividades
      </Button>
    </div>
  )
}
