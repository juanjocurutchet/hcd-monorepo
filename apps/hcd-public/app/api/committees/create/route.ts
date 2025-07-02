import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar permisos con await
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const presidentId = formData.get("presidentId") || null
    const secretaryId = formData.get("secretaryId") || null
    const isActive = formData.get("isActive") === "true"
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]")
    const proyectosRaw = formData.get("proyectos") as string || "[]"
    const proyectos = JSON.parse(proyectosRaw)

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Crear comisión
    const result = await sql`
      INSERT INTO committees (
        name, description, president_id, secretary_id, is_active
      ) VALUES (
        ${name}, ${description}, ${presidentId || null}, ${secretaryId || null}, ${isActive ?? true}
      )
      RETURNING id
    `

    const committeeId = result[0].id

    // Agregar miembros si existen
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        await sql`
          INSERT INTO committee_members (
            committee_id, council_member_id
          ) VALUES (
            ${committeeId}, ${memberId}
          )
        `
      }
    }

    // Guardar proyectos en commission_files
    for (let i = 0; i < proyectos.length; i++) {
      const p = proyectos[i]
      let fileUrl = null
      // Buscar el archivo en formData (por nombre: archivo_0, archivo_1, ...)
      const file = formData.get(`archivo_${i}`) as File | null
      if (file && file.size > 0) {
        fileUrl = await uploadFile(file, "comisiones")
      }
      await sql`
        INSERT INTO commission_files (
          committee_id, expediente_number, fecha_entrada, descripcion, despacho, fecha_despacho, file_url
        ) VALUES (
          ${committeeId}, ${p.expedienteNumber}, ${p.fechaEntrada}, ${p.descripcion}, ${p.despacho}, ${p.fechaDespacho || null}, ${fileUrl}
        )
      `
    }

    return NextResponse.json({
      success: true,
      id: committeeId,
    })
  } catch (error: any) {
    console.error("Error al crear comisión:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}