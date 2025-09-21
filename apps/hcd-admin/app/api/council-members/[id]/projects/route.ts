import { db } from "@/lib/db-singleton"
import { sessionFiles, councilMembers } from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params
    const councilMemberId = parseInt(params.id)

    if (isNaN(councilMemberId)) {
      return NextResponse.json(
        { error: 'ID de concejal inválido' },
        { status: 400 }
      )
    }

    // Verificar que el concejal existe
    const councilMember = await db
      .select()
      .from(councilMembers)
      .where(eq(councilMembers.id, councilMemberId))
      .limit(1)

    if (!councilMember.length) {
      return NextResponse.json(
        { error: 'Concejal no encontrado' },
        { status: 404 }
      )
    }

    // Obtener proyectos presentados por este concejal
    const projects = await db
      .select()
      .from(sessionFiles)
      .where(
        and(
          eq(sessionFiles.autor, councilMember[0].name),
          sql`${sessionFiles.autor} IS NOT NULL`
        )
      )
      .orderBy(desc(sessionFiles.fechaEntrada))

    // Agrupar proyectos por año
    const projectsByYear = projects.reduce((acc, project) => {
      const year = new Date(project.fechaEntrada).getFullYear()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(project)
      return acc
    }, {} as Record<number, typeof projects>)

    const response = NextResponse.json({
      success: true,
      councilMember: councilMember[0],
      totalProjects: projects.length,
      projectsByYear,
      projects // También enviar lista completa para compatibilidad
    })

    // Desactivar cache para obtener datos actualizados
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response

  } catch (error) {
    console.error('Error fetching council member projects:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}