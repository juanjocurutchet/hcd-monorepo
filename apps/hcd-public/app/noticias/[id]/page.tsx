import { getNewsById } from "@/actions/news-actions"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default async function NoticiaPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const noticia = await getNewsById(id)

  if (!noticia) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/novedades" className="text-[#0e4c7d] hover:underline flex items-center">
            ← Volver a novedades
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0e4c7d]">{noticia.title}</h1>

          <div className="text-gray-500 mb-6">
            {new Date(noticia.published_at).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {noticia.image_url && (
            <div className="mb-6">
              <Image
                src={noticia.image_url || "/placeholder.svg"}
                alt={noticia.title}
                width={800}
                height={450}
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
          )}

          <div className="prose max-w-none">
            {noticia.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </main>
  )
}
