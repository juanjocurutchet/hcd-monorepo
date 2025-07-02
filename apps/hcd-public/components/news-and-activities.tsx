import Link from "next/link"
import Image from "next/image"

const latestNews = [
  {
    id: 1,
    date: "10 DE MAYO DE 2025",
    title: "Las Flores ya tiene marco legal para motorhomes y casas rodantes: aprobaron ordenanza por unanimidad",
    excerpt:
      "El Concejo Deliberante aprobó por unanimidad una ordenanza que regula la circulación, pernocte y disposición de residuos de vehículos recreativos en el municipio.",
    image: "/concejo-deliberante-sesion.png",
    link: "/noticias/1",
  },
  {
    id: 2,
    date: "5 DE MAYO DE 2025",
    title: "Aprobaron la creación de una nueva defensoría civil",
    excerpt:
      "El proyecto fue presentado el 10 de abril a través de la Banca 21 y este jueves 24 salió aprobado por unanimidad.",
    image: "/concejo-deliberante-votacion.png",
    link: "/noticias/2",
  },
]

const councilActivities = [
  {
    id: 1,
    title: "Visita a escuelas rurales",
    link: "/actividades/1",
  },
  {
    id: 2,
    title: "Reunión con vecinos por obras de pavimentación",
    link: "/actividades/2",
  },
  {
    id: 3,
    title: "Participación en jornada ambiental",
    link: "/actividades/3",
  },
]

export default function NewsAndActivities() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna de noticias (3/4) */}
          <div className="md:col-span-3">
            {latestNews.map((news) => (
              <div key={news.id} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="relative h-48 w-full">
                    <Image
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500 mb-1">{news.date}</div>
                  <h3 className="text-xl font-bold text-[#0e4c7d] mb-2">
                    <Link href={news.link}>{news.title}</Link>
                  </h3>
                  <p className="text-gray-700 mb-3">{news.excerpt}</p>
                  <Link href={news.link} className="text-[#0e4c7d] font-medium hover:underline">
                    Leer más
                  </Link>
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <Link
                href="/novedades"
                className="inline-block px-6 py-2 bg-[#0e4c7d] text-white rounded hover:bg-[#0a3d68] transition-colors"
              >
                Ver todas las noticias
              </Link>
            </div>
          </div>

          {/* Columna de actividades (1/4) */}
          <div className="md:col-span-1">
            <div className="bg-[#0e4c7d] text-white p-4 mb-4">
              <h2 className="text-xl font-bold">Actividad de los concejales</h2>
            </div>
            <div className="bg-gray-100 p-4">
              <ul className="space-y-3">
                {councilActivities.map((activity) => (
                  <li key={activity.id}>
                    <Link href={activity.link} className="text-[#0e4c7d] hover:underline font-medium">
                      {activity.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <Link
                  href="/actividades"
                  className="inline-block px-4 py-1 bg-gray-200 text-[#0e4c7d] text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Ver todas las actividades
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}