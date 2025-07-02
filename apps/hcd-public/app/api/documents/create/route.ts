import { createOrdinance } from "@/lib/services/document-service"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()

    const approval_number = Number(formData.get("approval_number"))
    const title = formData.get("title") as string
    const year = Number(formData.get("year"))
    const tipo_disposicion = formData.get("tipo_disposicion") as string
    const type = formData.get("type") as string
    const category = formData.get("category") as string
    const notes = formData.get("notes") as string | undefined
    const is_active = formData.get("is_active") === "true"
    const file = formData.get("file") as File | null
    let file_url = undefined
    if (file && file.size > 0) {
      file_url = await uploadFile(file, "ordenanzas")
    }
    const slug = formData.get("slug") as string | undefined
    const modificadasIds = JSON.parse(formData.get("modificadasIds") as string || "[]")
    const derogadasIds = JSON.parse(formData.get("derogadasIds") as string || "[]")

    if (!approval_number || !title || !year || !type || !category) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const result = await createOrdinance({
      approval_number,
      title,
      year,
      type,
      category,
      notes,
      is_active,
      file_url,
      slug,
      modificadasIds,
      derogadasIds,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error al crear ordenanza:", error)
    return NextResponse.json({ error: error.message || "Error al crear la ordenanza" }, { status: 500 })
  }
}
