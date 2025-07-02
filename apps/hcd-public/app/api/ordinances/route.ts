import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const searchNumber = searchParams.get('searchNumber')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const year = searchParams.get('year')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir la consulta base
    let query = `
      SELECT
        o.id, o.approval_number, o.title, o.year, o.type, o.category,
        o.notes, o.is_active, o.file_url, o.slug, o.created_at,
        EXISTS (SELECT 1 FROM ordinance_modifica om WHERE om.ordinance_id = o.id) as has_modificatorias
      FROM ordinances o
      WHERE 1=1
    `
    const params: any[] = []

    // Agregar filtros
    if (search) {
      query += ` AND (title ILIKE $${params.length + 1} OR notes ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (searchNumber) {
      query += ` AND CAST(approval_number AS TEXT) ILIKE $${params.length + 1}`
      params.push(`%${searchNumber}%`)
    }

    if (category && category !== "all") {
      query += ` AND category ILIKE $${params.length + 1}`
      params.push(category)
    }

    let skipTypeFilterForOrdenanza = false;
    if (type && type !== "all") {
      if (type === "ordenanza") {
        // No filtrar por type para el contador de ordenanzas
        skipTypeFilterForOrdenanza = true;
      } else {
        query += ` AND type ILIKE $${params.length + 1}`
        params.push(type)
      }
    }

    if (year && year !== "all") {
      query += ` AND year = $${params.length + 1}`
      params.push(parseInt(year))
    }

    if (isActive && isActive !== "all") {
      query += ` AND is_active = $${params.length + 1}`
      params.push(isActive === 'true')
    }

    // Unificar la consulta en una sola línea para evitar problemas
    query = query.replace(/\n/g, ' ');

    // Agregar logs para depuración
    console.log("QUERY:", query);
    console.log("PARAMS:", params);

    // Contar total de resultados
    let countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM')
    if (skipTypeFilterForOrdenanza) {
      // Quitar el filtro de type para el conteo de ordenanzas
      countQuery = countQuery.replace(/ AND type ILIKE \$\d+/, '')
    }
    const countResult = await sql.query(countQuery, params);
    console.log("COUNT RESULT:", countResult);
    const total = countResult && countResult[0] ? parseInt(countResult[0].count) : 0

    // Agregar ordenamiento y paginación
    query += ` ORDER BY year DESC, approval_number DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await sql.query(query, params);
    console.log("RESULT:", result);

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error en GET /api/ordinances:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const approval_number = Number(formData.get("approval_number"))
    const title = formData.get("title") as string
    const year = Number(formData.get("year"))
    const type = formData.get("type") as string
    const category = formData.get("category") as string
    const notes = formData.get("notes") as string | undefined
    const is_active = formData.get("is_active") === "true"
    const file = formData.get("file") as File | null
    let slug = formData.get("slug") as string | undefined
    if (!slug) {
      slug = `ordenanza-${approval_number}-${year}`
    }
    let file_url = undefined
    if (file && file.size > 0) {
      // Extraer extensión
      const ext = file.name.split('.').pop();
      const publicId = `${slug}.${ext}`;
      file_url = await uploadFile(file, "ordenanzas", publicId);
    }
    const modificadasIds = JSON.parse(formData.get("modificadasIds") as string || "[]")
    const derogadasIds = JSON.parse(formData.get("derogadasIds") as string || "[]")

    if (!approval_number || !title || !year || !type || !category) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Insertar la ordenanza
    const result = await sql`
      INSERT INTO ordinances (approval_number, title, year, type, category, notes, is_active, file_url, slug)
      VALUES (${approval_number}, ${title}, ${year}, ${type}, ${category}, ${notes}, ${is_active}, ${file_url}, ${slug})
      RETURNING *
    `
    const ordinance = result[0]

    // Guardar relaciones modificatorias
    if (Array.isArray(modificadasIds) && modificadasIds.length > 0) {
      for (const modificadaId of modificadasIds) {
        await sql`INSERT INTO ordinance_modifica (ordinance_id, modificadora_numero) VALUES (${modificadaId}, ${ordinance.approval_number}) ON CONFLICT DO NOTHING`
      }
    }
    // Guardar relaciones derogadas
    if (Array.isArray(derogadasIds) && derogadasIds.length > 0) {
      for (const derogadaId of derogadasIds) {
        await sql`UPDATE ordinances SET derogada_por = ${ordinance.approval_number}, is_active = false WHERE id = ${derogadaId}`
      }
    }

    return NextResponse.json(ordinance)
  } catch (error: any) {
    console.error("Error al crear ordenanza:", error)
    return NextResponse.json({ error: error.message || "Error al crear la ordenanza" }, { status: 500 })
  }
}