import { db } from "@/lib/db-singleton"
import { ordinances } from "@/lib/db/schema"
import { isNotNull, eq, gte, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
})

interface MoveResult {
  ordinanceId: number
  approvalNumber: number
  year: number
  oldPublicId: string
  newPublicId?: string
  status: 'success' | 'error' | 'skipped'
  error?: string
}

// Extraer public_id desde la URL de Cloudinary
function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/)
  return match ? match[1] : null
}

// Mover archivo en Cloudinary usando rename
async function moveFileInCloudinary(oldPublicId: string, newPublicId: string): Promise<string> {
  try {
    console.log(`📁 Moviendo: ${oldPublicId} → ${newPublicId}`)
    
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: 'auto',
      overwrite: true
    })
    
    console.log(`✅ Movido exitosamente: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Error moviendo archivo:`, error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener archivos de 2024 y 2025 que están sueltos (no en carpetas)
    const recentOrdinances = await db
      .select()
      .from(ordinances)
      .where(
        and(
          isNotNull(ordinances.file_url),
          gte(ordinances.year, 2024)
        )
      )
      .orderBy(ordinances.year, ordinances.approval_number)

    // Filtrar solo los que están sueltos (no en carpetas de año)
    const needsMove = recentOrdinances.filter(ord => {
      if (!ord.file_url) return false
      
      const publicId = extractPublicIdFromUrl(ord.file_url)
      if (!publicId) return false
      
      // Si el public_id es "ordenanzas/ordenanza-XXXX-YYYY" está suelto
      // Si es "ordenanzas/YYYY/ordenanza-XXXX-YYYY" está en carpeta
      return publicId.includes('ordenanzas/ordenanza-') && 
             !publicId.includes(`ordenanzas/${ord.year}/`)
    })

    const stats = {
      total: recentOrdinances.length,
      needsMove: needsMove.length,
      alreadyInFolders: recentOrdinances.length - needsMove.length,
      byYear: {} as Record<number, { total: number, needMove: number }>
    }

    // Estadísticas por año
    recentOrdinances.forEach(ord => {
      const year = ord.year
      if (!stats.byYear[year]) {
        stats.byYear[year] = { total: 0, needMove: 0 }
      }
      stats.byYear[year].total++
      
      if (needsMove.includes(ord)) {
        stats.byYear[year].needMove++
      }
    })

    return NextResponse.json({
      message: "Move analysis completed",
      stats,
      sampleFiles: needsMove.slice(0, 5).map(ord => ({
        id: ord.id,
        approvalNumber: ord.approval_number,
        year: ord.year,
        currentUrl: ord.file_url,
        needsMove: true
      }))
    })

  } catch (error) {
    console.error('Error analyzing move:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze move' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 20, dryRun = false, year } = await request.json()

    // Obtener archivos que necesitan moverse
    let query = db
      .select()
      .from(ordinances)
      .where(
        and(
          isNotNull(ordinances.file_url),
          gte(ordinances.year, 2024)
        )
      )

    if (year) {
      query = query.where(eq(ordinances.year, parseInt(year)))
    }

    const ordinancesToMove = await query
      .orderBy(ordinances.year, ordinances.approval_number)
      .limit(limit)

    // Filtrar solo los que necesitan moverse
    const needsMove = ordinancesToMove.filter(ord => {
      if (!ord.file_url) return false
      
      const publicId = extractPublicIdFromUrl(ord.file_url)
      if (!publicId) return false
      
      return publicId.includes('ordenanzas/ordenanza-') && 
             !publicId.includes(`ordenanzas/${ord.year}/`)
    })

    console.log(`📦 Found ${needsMove.length} files to move to folders`)

    const results: MoveResult[] = []

    for (const ordinance of needsMove) {
      const result: MoveResult = {
        ordinanceId: ordinance.id,
        approvalNumber: ordinance.approval_number,
        year: ordinance.year,
        oldPublicId: '',
        status: 'error'
      }

      try {
        const oldPublicId = extractPublicIdFromUrl(ordinance.file_url!)
        if (!oldPublicId) {
          result.error = 'Could not extract public_id from URL'
          results.push(result)
          continue
        }

        result.oldPublicId = oldPublicId

        // Generar nuevo public_id en la carpeta correcta
        const newPublicId = `ordenanzas/${ordinance.year}/ordenanza-${ordinance.approval_number}-${ordinance.year}`

        if (dryRun) {
          result.status = 'skipped'
          result.newPublicId = `[DRY RUN] Would move to: ${newPublicId}`
          results.push(result)
          continue
        }

        // Mover archivo en Cloudinary
        const newUrl = await moveFileInCloudinary(oldPublicId, newPublicId)

        // Actualizar base de datos con nueva URL
        await db
          .update(ordinances)
          .set({ 
            file_url: newUrl,
            updated_at: new Date()
          })
          .where(eq(ordinances.id, ordinance.id))

        result.status = 'success'
        result.newPublicId = newPublicId

        console.log(`✅ Moved ${ordinance.approval_number}/${ordinance.year} to folder`)

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error moving ${ordinance.approval_number}/${ordinance.year}:`, error)
      }

      results.push(result)
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      skipped: results.filter(r => r.status === 'skipped').length,
    }

    return NextResponse.json({
      success: true,
      message: `Move to folders ${dryRun ? 'preview' : 'completed'}`,
      summary,
      results: dryRun ? results : results.slice(0, 10)
    })

  } catch (error) {
    console.error('Error moving files to folders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to move files to folders' },
      { status: 500 }
    )
  }
}