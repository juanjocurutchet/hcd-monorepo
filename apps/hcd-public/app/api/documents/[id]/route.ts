import { deleteDocument, getDocumentById, updateOrdinance } from "@/lib/services/document-service"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

async function validateAdminAndId(request: NextRequest, idParam: string) {
  if (!(await isAdmin(request))) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  }

  const id = Number.parseInt(idParam)
  if (isNaN(id)) {
    return { error: NextResponse.json({ error: "ID inválido" }, { status: 400 }) }
  }

  return { id }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const document = await getDocumentById(id)

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error(`Error obteniendo documento con id ${params.id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id, error } = await validateAdminAndId(request, params.id)
    if (error) return error

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

    const result = await updateOrdinance({
      id,
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
    console.error(`Error actualizando ordenanza con id ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id, error } = await validateAdminAndId(request, params.id)
    if (error) return error

    await deleteDocument(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error eliminando documento con id ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
