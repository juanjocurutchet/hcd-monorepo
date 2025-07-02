import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react"
import { getActivityWithParticipants } from "@/actions/activiity-actions"

export default async function ActividadPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const actividad = await getActivityWithParticipants(id)

  if (!actividad) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/novedades/actividad-concejales" className="text-[#0e4c7d] hover:underline flex items-center">
            ← Volver a actividades
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0e4c7d]">{actividad.title}</h1>

          <div className="text-gray-500 mb-6">
            {new Date(actividad.date).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {actividad.image_url && (
            <div className="mb-6">
              <Image
                src={actividad.image_url || "/placeholder.svg"}
                alt={actividad.title}
                width={800}
                height={450}
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
          )}

          <div className="prose max-w-none mb-6">
            {actividad.description.split("\n").map((paragraph: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="font-bold mb-2">Concejales participantes:</h2>
            <ul className="list-disc pl-5">
              {actividad.participants.map((participant: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                <li key={index}>{participant}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </main>
  )
}