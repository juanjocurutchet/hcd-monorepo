"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  usuario: {
    id: number
    name: string
  }
}

export default function EliminarUsuarioForm({ usuario }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await fetch(`/api/usuarios/${usuario.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      router.push("/admin-panel/usuarios")
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
  }

  return (
    <div className="space-y-4">
      <p>
        ¿Estás seguro de que deseas eliminar al usuario <strong>{usuario.name}</strong>? Esta acción no se puede
        deshacer.
      </p>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
      </div>
    </div>
  )
}
