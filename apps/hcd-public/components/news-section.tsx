import { getLatestNews } from "@/actions/news-actions"
import Image from "next/image"
import Link from "next/link"

export default async function NewsSection() {
  const news = await getLatestNews(3)

  if (news.length === 0) {
    return (
      <div className="p-8 bg-gray-100 rounded-md text-center">
        <p className="text-gray-500">No hay noticias disponibles</p>
      </div>
    )
  }

  return (
    <div>
      {news.map((item) => (
        <article key={item.id} className="mb-8 pb-8 border-b border-gray-200 last:border-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <Image
                src={item.image_url || "/placeholder.svg?height=200&width=300"}
                alt={item.title}
                width={300}
                height={200}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="md:w-2/3">
              <span className="text-xs text-gray-500">
                {new Date(item.published_at)
                  .toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  .toUpperCase()}
              </span>
              <h2 className="text-xl font-bold text-[#0e4c7d] mt-1 mb-2">
                <Link href={`/noticias/${item.id}`}>{item.title}</Link>
              </h2>
              <p className="text-gray-700">{item.excerpt || item.content.substring(0, 150) + "..."}</p>
              <Link href={`/noticias/${item.id}`} className="inline-block mt-3 text-[#0e4c7d] hover:underline">
                Leer más →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
