import { type NextRequest, NextResponse } from "next/server"
import { getLatestNews, getNewsCount } from "@/lib/services/news-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const onlyPublished = searchParams.get("onlyPublished") !== "false"

    // Obtener noticias
    const news = await getLatestNews(limit, offset, onlyPublished)

    // Obtener total de noticias
    const count = await getNewsCount(onlyPublished)

    return NextResponse.json({
      data: news,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo noticias:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
