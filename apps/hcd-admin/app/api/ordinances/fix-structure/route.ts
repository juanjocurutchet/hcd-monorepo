import { db } from "@/lib/db-singleton"
import { ordinances } from "@/lib/db/schema"
import { isNotNull, eq, gte, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface FixResult {
  ordinanceId: number
  approvalNumber: number
  year: number
  oldUrl: string
  newUrl?: string
  status: 'success' | 'error' | 'skipped'
  error?: string
}

// Extraer public_id desde la URL de Cloudinary
function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/)
  return match ? (match[1] ?? null) : null
}

// Crear carpetas y mover archivos
async function moveFileToCorrectFolder(oldPublicId: string, year: number, approvalNumber: number): Promise<string> {
  try {
    // Nuevo public_id con estructura correcta
    const newPublicId = `ordenanzas/${year}/ordenanza-${approvalNumber}-${year}`
    
    console.log(`📁 Moving: ${oldPublicId} → ${newPublicId}`)
    
    // Usar el método rename para mover el archivo
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: 'auto',
      overwrite: true
    })
    
    console.log(`✅ Successfully moved to: ${result.secure_url}`)
    return result.secure_url
    
  } catch (error) {
    console.error(`❌ Error moving file:`, error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Analizar archivos de años recientes que necesitan reorganización
    const recentOrdinances = await db
      .select()
      .from(ordinances)
      .where(
        and(
          isNotNull(ordinances.file_url),
          gte(ordinances.year, 2023)  // Solo años recientes
        )
      )
      .orderBy(ordinances.year, ordinances.approval_number)

    const needsFix = recentOrdinances.filter(ord => {
      if (!ord.file_url) return false
      
      // Verificar si la URL tiene la estructura física correcta en Cloudinary
      // Si está en la raíz de ordenanzas y no en una subcarpeta, necesita arreglo
      return ord.file_url.includes('/ordenanzas/ordenanza-') && 
             !ord.file_url.includes(`/ordenanzas/${ord.year}/`)
    })

    return NextResponse.json({
      total: recentOrdinances.length,
      needsFix: needsFix.length,
      alreadyCorrect: recentOrdinances.length - needsFix.length,
      sample: needsFix.slice(0, 5).map(ord => ({
        id: ord.id,
        approvalNumber: ord.approval_number,
        year: ord.year,
        currentUrl: ord.file_url,
        shouldBeIn: `ordenanzas/${ord.year}/`
      }))
    })

  } catch (error) {
    console.error('Error analyzing structure:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze structure' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 20, dryRun = false, year } = await request.json()

    // Obtener archivos que necesitan corrección
    const whereConditions = [
      isNotNull(ordinances.file_url),
      gte(ordinances.year, 2023)
    ]

    if (year) {
      whereConditions.push(eq(ordinances.year, parseInt(year)))
    }

    const ordinancesToFix = await db
      .select()
      .from(ordinances)
      .where(and(...whereConditions))
      .orderBy(ordinances.year, ordinances.approval_number)
      .limit(limit)

    // Filtrar solo los que necesitan corrección
    const needsFix = ordinancesToFix.filter(ord => {
      if (!ord.file_url) return false
      return ord.file_url.includes('/ordenanzas/ordenanza-') && 
             !ord.file_url.includes(`/ordenanzas/${ord.year}/`)
    })

    console.log(`🔧 Found ${needsFix.length} files to fix structure`)

    const results: FixResult[] = []

    for (const ordinance of needsFix) {
      const result: FixResult = {
        ordinanceId: ordinance.id,
        approvalNumber: ordinance.approval_number,
        year: ordinance.year,
        oldUrl: ordinance.file_url!,
        status: 'error'
      }

      try {
        const oldPublicId = extractPublicIdFromUrl(ordinance.file_url!)
        if (!oldPublicId) {
          result.error = 'Could not extract public_id from URL'
          results.push(result)
          continue
        }

        if (dryRun) {
          result.status = 'skipped'
          result.newUrl = `[DRY RUN] Would move to: ordenanzas/${ordinance.year}/ordenanza-${ordinance.approval_number}-${ordinance.year}`
          results.push(result)
          continue
        }

        // Mover archivo a la estructura correcta
        const newUrl = await moveFileToCorrectFolder(oldPublicId, ordinance.year, ordinance.approval_number)

        // Actualizar base de datos
        await db
          .update(ordinances)
          .set({ 
            file_url: newUrl,
            updated_at: new Date()
          })
          .where(eq(ordinances.id, ordinance.id))

        result.status = 'success'
        result.newUrl = newUrl

        console.log(`✅ Fixed ${ordinance.approval_number}/${ordinance.year}`)

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error fixing ${ordinance.approval_number}/${ordinance.year}:`, error)
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
      message: `Structure fix ${dryRun ? 'preview' : 'completed'}`,
      summary,
      results: dryRun ? results : results.slice(0, 10)
    })

  } catch (error) {
    console.error('Error fixing structure:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fix structure' },
      { status: 500 }
    )
  }
}