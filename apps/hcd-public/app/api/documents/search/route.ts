import { type NextRequest, NextResponse } from "next/server"
import { searchDocuments } from "@/lib/services/document-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchTerm = searchParams.get("q") || undefined
    const type = searchParams.get("type") as "ordenanza" | "decreto" | "resolucion" | "comunicacion" | undefined
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    const documents = await searchDocuments({
      searchTerm,
      type,
      startDate,
      endDate,
      limit,
      offset,
    })

    return NextResponse.json(documents)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al buscar documentos" }, { status: 500 })
  }
}
