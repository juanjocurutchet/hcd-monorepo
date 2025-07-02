import { notFound } from "next/navigation"
import EliminarMensajeForm from "../../components/eliminar-mensaje-form"
import { getMessageById } from "@/lib/services/message-service"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EliminarMensajePage({ params }: PageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  const mensaje = await getMessageById(id)
  if (!mensaje) notFound()

  return (
    <div className="max-w-2xl mx-auto py-10">
      <EliminarMensajeForm mensaje={{ id: mensaje.id, subject: mensaje.subject }} />
    </div>
  )
}
