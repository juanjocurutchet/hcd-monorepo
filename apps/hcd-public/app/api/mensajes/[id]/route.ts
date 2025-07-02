import { type NextRequest, NextResponse } from "next/server"
import { deleteMessage } from "@/lib/services/message-service"
import { isAdmin } from "@/lib/utils/server-utils"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    await deleteMessage(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error eliminando mensaje:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
