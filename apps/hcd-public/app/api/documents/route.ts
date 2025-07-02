import { type NextRequest, NextResponse } from "next/server"
import { getDocumentsByType, getDocumentsCount } from "@/lib/services/document-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const type = searchParams.get("type") as "ordenanza" | "decreto" | "resolucion" | "comunicacion" | undefined
    const onlyPublished = searchParams.get("onlyPublished") !== "false"

    // Obtener documentos
    const documents = type
      ? await getDocumentsByType(type, limit, offset)
      : await searchDocuments({ limit, offset, onlyPublished })

    // Obtener total de documentos
    const count = await getDocumentsCount({ type, onlyPublished })

    return NextResponse.json({
      data: documents,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo documentos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Importar la función que faltaba
import { searchDocuments } from "@/lib/services/document-service"
