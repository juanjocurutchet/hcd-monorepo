import { notFound } from "next/navigation"
import { getMessageById, markMessageAsRead } from "@/lib/services/message-service"
import { format } from "date-fns"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default async function VerMensajePage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const mensaje = await getMessageById(id)
  if (!mensaje) notFound()

  if (!mensaje.isRead) {
    await markMessageAsRead(id)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{mensaje.subject}</h1>
        <p className="text-gray-600">
          Enviado por <strong>{mensaje.name}</strong> ({mensaje.email}) — {format(new Date(mensaje.createdAt), "dd/MM/yyyy HH:mm")}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 whitespace-pre-line">
        {mensaje.message}
      </div>

      <div className="mt-6 flex justify-end">
        <Link href={`/admin-panel/mensajes/${mensaje.id}/eliminar`} className="text-red-600 hover:underline">
          Eliminar mensaje
        </Link>
      </div>
    </div>
  )
}
