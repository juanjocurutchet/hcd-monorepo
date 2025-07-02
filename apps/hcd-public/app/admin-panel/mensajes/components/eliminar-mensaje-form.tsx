"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  mensaje: {
    id: number
    subject: string
  }
}

export default function EliminarMensajeForm({ mensaje }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      router.push("/admin-panel/mensajes")
    } catch (error) {
      console.error("Error al eliminar mensaje:", error)
    }
  }

  return (
    <div className="space-y-4">
      <p>
        ¿Estás seguro de que deseas eliminar el mensaje <strong>{mensaje.subject}</strong>? Esta acción no se puede
        deshacer.
      </p>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
      </div>
    </div>
  )
}
