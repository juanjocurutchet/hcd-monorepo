import { sql } from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  try {
    const params = await context.params;
    const { slug } = params;
    let result;
    if (/^\d+$/.test(slug)) {
      // Buscar por ID numérico
      result = await sql`
        SELECT id, approval_number, title, year, type, category, notes, is_active, file_url, slug, created_at
        FROM ordinances
        WHERE id = ${Number(slug)}
      `
    } else {
      // Buscar por slug
      result = await sql`
        SELECT id, approval_number, title, year, type, category, notes, is_active, file_url, slug, created_at
        FROM ordinances
        WHERE slug = ${slug}
      `
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Ordenanza no encontrada' },
        { status: 404 }
      )
    }
    const ordinance = result[0]

    // Buscar modificatorias: obtener los numeros de las modificadoras
    const modRows = await sql`
      SELECT modificadora_numero FROM ordinance_modifica WHERE ordinance_id = ${ordinance.id}
    `
    const modificadoraNumeros = modRows.map((row: any) => row.modificadora_numero).filter(Boolean)
    let modificatorias = []
    if (modificadoraNumeros.length > 0) {
      modificatorias = await sql`
        SELECT id, approval_number, title, year, type, category, notes, is_active, file_url, slug, created_at
        FROM ordinances
        WHERE approval_number = ANY(${modificadoraNumeros})
      `
    }

    // Buscar ordenanzas que esta ordenanza modifica
    const modificaRows = await sql`
      SELECT ordinance_id FROM ordinance_modifica WHERE modificadora_numero = ${ordinance.approval_number}
    `
    const modificaIds = modificaRows.map((row: any) => row.ordinance_id).filter(Boolean)
    let modificaOrdenanzas = []
    if (modificaIds.length > 0) {
      modificaOrdenanzas = await sql`
        SELECT id, approval_number, title, year, type, category, notes, is_active, file_url, slug, created_at
        FROM ordinances
        WHERE id = ANY(${modificaIds})
      `
    }

    // Buscar ordenanzas que esta ordenanza deroga
    const derogaRows = await sql`
      SELECT id, approval_number, title, year FROM ordinances WHERE derogada_por = ${ordinance.approval_number}
    `
    let derogaOrdenanzas = []
    if (derogaRows.length > 0) {
      derogaOrdenanzas = derogaRows
    }

    return NextResponse.json({ ...ordinance, modificatorias, modificaOrdenanzas, derogaOrdenanzas })
  } catch (error) {
    console.error('Error en GET /api/ordinances/[slug]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: { params: { slug: string } }) {
  try {
    const params = await context.params;
    const { slug } = params;
    let result;
    if (/^\d+$/.test(slug)) {
      // Buscar por ID numérico
      result = await sql`DELETE FROM ordinances WHERE id = ${Number(slug)} RETURNING *`
    } else {
      // Buscar por slug
      result = await sql`DELETE FROM ordinances WHERE slug = ${slug} RETURNING *`
    }
    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Ordenanza no encontrada' },
        { status: 404 }
      )
    }
    // Eliminar relaciones en ordinance_modifica
    const deleted = result[0]
    await sql`DELETE FROM ordinance_modifica WHERE ordinance_id = ${deleted.id} OR modificadora_numero = ${deleted.approval_number}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/ordinances/[slug]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: { params: { slug: string } }) {
  try {
    const params = await context.params;
    const { slug } = params;
    let id: number | null = null;
    let prevFileUrl: string | null = null;
    if (/^\d+$/.test(slug)) {
      const res = await sql`SELECT id, file_url FROM ordinances WHERE id = ${Number(slug)}`;
      if (!res || res.length === 0) {
        return NextResponse.json({ error: 'Ordenanza no encontrada' }, { status: 404 });
      }
      id = res[0].id;
      prevFileUrl = res[0].file_url;
    } else {
      const res = await sql`SELECT id, file_url FROM ordinances WHERE slug = ${slug}`;
      if (!res || res.length === 0) {
        return NextResponse.json({ error: 'Ordenanza no encontrada' }, { status: 404 });
      }
      id = res[0].id;
      prevFileUrl = res[0].file_url;
    }
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const formData = await request.formData();
    const approval_number = Number(formData.get("approval_number"));
    const title = formData.get("title") as string;
    const year = Number(formData.get("year"));
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const notes = formData.get("notes") as string | undefined;
    const is_active = formData.get("is_active") === "true";
    const file = formData.get("file") as File | null;
    let file_url = formData.get("file_url") as string | undefined;
    const eliminarArchivo = formData.get("eliminar_archivo") === "true";

    // Eliminar archivo anterior si corresponde
    if ((eliminarArchivo || (file && file.size > 0)) && prevFileUrl) {
      // Extraer public_id de la url de Cloudinary
      const match = prevFileUrl.match(/\/([^\/]+)\.[a-zA-Z0-9]+$/);
      if (match) {
        const publicId = prevFileUrl.substring(prevFileUrl.indexOf("ordenanzas/"), prevFileUrl.lastIndexOf("."));
        await deleteFile(publicId);
      }
      if (eliminarArchivo && !(file && file.size > 0)) {
        file_url = null;
      }
    }
    let slugValue = formData.get("slug") as string | undefined;
    if (!slugValue) {
      slugValue = `ordenanza-${approval_number}-${year}`;
    }
    if (file && file.size > 0) {
      // Extraer extensión
      const ext = file.name.split('.').pop();
      const publicId = `${slugValue}.${ext}`;
      file_url = await uploadFile(file, "ordenanzas", publicId);
    }
    const modificadasIds = JSON.parse(formData.get("modificadasIds") as string || "[]");
    const derogadasIds = JSON.parse(formData.get("derogadasIds") as string || "[]");

    if (!approval_number || !title || !year || !type || !category) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Actualizar la ordenanza
    let updateQuery = sql`
      UPDATE ordinances SET approval_number=${approval_number}, title=${title}, year=${year}, type=${type}, category=${category}, notes=${notes}, is_active=${is_active}, slug=${slugValue}`;
    if (file_url !== undefined) {
      updateQuery = sql`${updateQuery}, file_url=${file_url}`;
    }
    updateQuery = sql`${updateQuery} WHERE id = ${id} RETURNING *`;
    const result = await updateQuery;
    const ordinance = result[0];

    // Limpiar relaciones anteriores
    await sql`DELETE FROM ordinance_modifica WHERE modificadora_numero = ${ordinance.approval_number}`;
    await sql`UPDATE ordinances SET derogada_por = NULL, is_active = true WHERE derogada_por = ${ordinance.approval_number}`;

    // Guardar relaciones modificatorias
    if (Array.isArray(modificadasIds) && modificadasIds.length > 0) {
      for (const modificadaId of modificadasIds) {
        await sql`INSERT INTO ordinance_modifica (ordinance_id, modificadora_numero) VALUES (${modificadaId}, ${ordinance.approval_number}) ON CONFLICT DO NOTHING`;
      }
    }
    // Guardar relaciones derogadas
    if (Array.isArray(derogadasIds) && derogadasIds.length > 0) {
      for (const derogadaId of derogadasIds) {
        await sql`UPDATE ordinances SET derogada_por = ${ordinance.approval_number}, is_active = false WHERE id = ${derogadaId}`;
      }
    }

    return NextResponse.json(ordinance);
  } catch (error: any) {
    console.error('Error en PUT /api/ordinances/[slug]:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}