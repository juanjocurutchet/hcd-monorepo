import Link from "next/link"
import { Video, Search, Users, Mail, UserCheck } from "lucide-react"

const quickAccessItems = [
  {
    icon: <Video className="w-12 h-12 text-[#0e4c7d]" />,
    title: "Sesiones en vivo",
    description: "2° y 4° jueves de cada mes",
    subtext: "Historial de sesiones",
    link: "/sesiones/transmisiones",
  },
  {
    icon: <Search className="w-12 h-12 text-[#0e4c7d]" />,
    title: "Buscar ordenanzas",
    description: "Ordenanzas, resoluciones y decretos municipales",
    link: "/legislacion",
  },
  {
    icon: <Users className="w-12 h-12 text-[#0e4c7d]" />,
    title: "Solicitar Banca Abierta",
    description: "Participación ciudadana en sesiones para exponer temas de interés local",
    link: "/banca-abierta",
  },
  {
    icon: <Mail className="w-12 h-12 text-[#0e4c7d]" />,
    title: "Contactar al presidente",
    description: "Enviar notas o solicitar audiencia con el presidente del HCD",
    link: "/contacto/presidente",
  },
  {
    icon: <UserCheck className="w-12 h-12 text-[#0e4c7d]" />,
    title: "Atención ciudadana",
    description: "Información, reclamos, iniciativas, consultas",
    link: "/atencion-ciudadana",
  },
]

export default function QuickAccess() {
  return (
    <div className="py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {quickAccessItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-3">{item.icon}</div>
              <h3 className="text-lg font-bold text-[#0e4c7d] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              {item.subtext && <p className="text-xs text-gray-500">{item.subtext}</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}