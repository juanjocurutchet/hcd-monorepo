import { db } from "@/lib/db-singleton"
import { ordinances } from "@/lib/db/schema"
import { isNotNull, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface ReorganizeResult {
  ordinanceId: number
  approvalNumber: number
  year: number
  oldUrl: string
  newUrl?: string
  status: 'success' | 'error' | 'skipped'
  error?: string
}

async function moveFileInCloudinary(oldPublicId: string, newPublicId: string): Promise<string> {
  try {
    // Usar el método rename de Cloudinary para mover el archivo
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: 'auto',
      overwrite: true
    })
    
    console.log(`✅ Moved: ${oldPublicId} → ${newPublicId}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Error moving ${oldPublicId}:`, error)
    throw error
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  // Extraer public_id de la URL de Cloudinary
  // Ejemplo: https://res.cloudinary.com/dpn8we0s3/raw/upload/v1758467450/ordenanzas/ordenanza-3659-2025.docx
  const match = url.match(/\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/)
  return match ? match[1] : null
}

export async function GET(request: NextRequest) {
  try {
    // Obtener ordenanzas que necesitan reorganización (archivos subidos incorrectamente)
    const ordinancesToReorganize = await db
      .select()
      .from(ordinances)
      .where(isNotNull(ordinances.file_url))
      .orderBy(ordinances.year, ordinances.approval_number)

    // Filtrar solo las que NO están en la estructura correcta
    const needReorganization = ordinancesToReorganize.filter(ord => {
      if (!ord.file_url) return false
      
      // Verificar si la URL ya tiene la estructura correcta
      // Estructura correcta: /ordenanzas/2025/ordenanza-3659-2025.docx
      // Estructura incorrecta: /ordenanzas/ordenanza-3659-2025.docx
      const publicId = extractPublicIdFromUrl(ord.file_url)
      if (!publicId) return false
      
      // Si no contiene el año como carpeta, necesita reorganización
      return !publicId.includes(`ordenanzas/${ord.year}/`)
    })

    const stats = {
      total: ordinancesToReorganize.length,
      needReorganization: needReorganization.length,
      alreadyOrganized: ordinancesToReorganize.length - needReorganization.length,
      byYear: {} as Record<number, { total: number, needReorg: number }>
    }

    // Estadísticas por año
    ordinancesToReorganize.forEach(ord => {
      const year = ord.year
      if (!stats.byYear[year]) {
        stats.byYear[year] = { total: 0, needReorg: 0 }
      }
      stats.byYear[year].total++
      
      if (needReorganization.includes(ord)) {
        stats.byYear[year].needReorg++
      }
    })

    return NextResponse.json({
      message: "Reorganization analysis completed",
      stats,
      sampleFiles: needReorganization.slice(0, 5).map(ord => ({
        id: ord.id,
        approvalNumber: ord.approval_number,
        year: ord.year,
        currentUrl: ord.file_url,
        needsReorganization: true
      }))
    })

  } catch (error) {
    console.error('Error analyzing reorganization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze reorganization' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 10, dryRun = false } = await request.json()

    // Obtener ordenanzas que necesitan reorganización
    const ordinancesToReorganize = await db
      .select()
      .from(ordinances)
      .where(isNotNull(ordinances.file_url))
      .orderBy(ordinances.year, ordinances.approval_number)
      .limit(limit)

    // Filtrar solo las que NO están en la estructura correcta
    const needReorganization = ordinancesToReorganize.filter(ord => {
      if (!ord.file_url) return false
      
      const publicId = extractPublicIdFromUrl(ord.file_url)
      if (!publicId) return false
      
      return !publicId.includes(`ordenanzas/${ord.year}/`)
    })

    console.log(`📁 Found ${needReorganization.length} files to reorganize`)

    const results: ReorganizeResult[] = []

    for (const ordinance of needReorganization) {
      const result: ReorganizeResult = {
        ordinanceId: ordinance.id,
        approvalNumber: ordinance.approval_number,
        year: ordinance.year,
        oldUrl: ordinance.file_url!,
        status: 'error'
      }

      try {
        // Extraer public_id actual
        const oldPublicId = extractPublicIdFromUrl(ordinance.file_url!)
        if (!oldPublicId) {
          result.error = 'No se pudo extraer public_id de la URL'
          results.push(result)
          continue
        }

        // Generar nuevo public_id con estructura correcta
        const newPublicId = `ordenanzas/${ordinance.year}/ordenanza-${ordinance.approval_number}-${ordinance.year}`

        if (dryRun) {
          result.status = 'skipped'
          result.newUrl = `[DRY RUN] ${oldPublicId} → ${newPublicId}`
          results.push(result)
          continue
        }

        // Mover archivo en Cloudinary
        const newUrl = await moveFileInCloudinary(oldPublicId, newPublicId)

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

        console.log(`✅ ${ordinance.approval_number}/${ordinance.year}: ${newUrl}`)

      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error reorganizing ${ordinance.approval_number}/${ordinance.year}:`, error)
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
      message: `Reorganization ${dryRun ? 'preview' : 'completed'}`,
      summary,
      results: dryRun ? results.slice(0, 10) : results
    })

  } catch (error) {
    console.error('Error reorganizing files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reorganize files' },
      { status: 500 }
    )
  }
}