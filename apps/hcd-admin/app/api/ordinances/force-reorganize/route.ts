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

interface ReorganizeResult {
  approvalNumber: number
  year: number
  originalPublicId: string
  newPublicId?: string
  status: 'success' | 'error' | 'not_found'
  newUrl?: string
  error?: string
}

// Buscar archivo por diferentes patrones posibles
async function findFileInCloudinary(approvalNumber: number, year: number): Promise<string | null> {
  const possiblePatterns = [
    `ordenanzas/ordenanza-${approvalNumber}-${year}`,
    `ordenanzas/${year}/ordenanza-${approvalNumber}-${year}`,
    `ordenanza-${approvalNumber}-${year}`,
    `ordenanzas/ordenanza-${approvalNumber}`,
  ]
  
  for (const pattern of possiblePatterns) {
    try {
      // Buscar archivos con ese patrón
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: pattern,
        max_results: 10,
        resource_type: 'raw'
      })
      
      if (result.resources.length > 0) {
        console.log(`✅ Encontrado: ${result.resources[0].public_id}`)
        return result.resources[0].public_id
      }
    } catch (error) {
      // Continuar con el siguiente patrón
    }
  }
  
  return null
}

// Mover archivo a la ubicación correcta
async function moveToCorrectLocation(originalPublicId: string, approvalNumber: number, year: number): Promise<string> {
  const targetPublicId = `ordenanzas/${year}/ordenanza-${approvalNumber}-${year}`
  
  try {
    console.log(`📁 Moviendo: ${originalPublicId} → ${targetPublicId}`)
    
    const result = await cloudinary.uploader.rename(originalPublicId, targetPublicId, {
      resource_type: 'raw',
      overwrite: true
    })
    
    console.log(`✅ Movido exitosamente: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Error moviendo archivo:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { year, limit = 50, dryRun = false } = await request.json()
    
    if (!year || (year !== 2024 && year !== 2025)) {
      return NextResponse.json(
        { error: 'Year must be 2024 or 2025' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 Iniciando reorganización forzada para año ${year}`)
    
    // Obtener ordenanzas del año especificado
    const ordinancesOfYear = await db
      .select()
      .from(ordinances)
      .where(eq(ordinances.year, year))
      .orderBy(ordinances.approval_number)
      .limit(limit)
    
    console.log(`📋 Procesando ${ordinancesOfYear.length} ordenanzas del año ${year}`)
    
    const results: ReorganizeResult[] = []
    
    for (const ordinance of ordinancesOfYear) {
      const result: ReorganizeResult = {
        approvalNumber: ordinance.approval_number,
        year: ordinance.year,
        originalPublicId: '',
        status: 'error'
      }
      
      try {
        // Buscar el archivo en Cloudinary
        const foundPublicId = await findFileInCloudinary(ordinance.approval_number, ordinance.year)
        
        if (!foundPublicId) {
          result.status = 'not_found'
          result.error = 'Archivo no encontrado en Cloudinary'
          results.push(result)
          continue
        }
        
        result.originalPublicId = foundPublicId
        
        // Verificar si ya está en la ubicación correcta
        const targetLocation = `ordenanzas/${ordinance.year}/ordenanza-${ordinance.approval_number}-${ordinance.year}`
        
        if (foundPublicId === targetLocation) {
          result.status = 'success'
          result.newPublicId = foundPublicId
          result.newUrl = `Already in correct location`
          results.push(result)
          continue
        }
        
        if (dryRun) {
          result.status = 'success'
          result.newPublicId = `[DRY RUN] Would move to: ${targetLocation}`
          results.push(result)
          continue
        }
        
        // Mover archivo a la ubicación correcta
        const newUrl = await moveToCorrectLocation(foundPublicId, ordinance.approval_number, ordinance.year)
        
        // Actualizar base de datos
        await db
          .update(ordinances)
          .set({ 
            file_url: newUrl,
            updated_at: new Date()
          })
          .where(eq(ordinances.id, ordinance.id))
        
        result.status = 'success'
        result.newPublicId = targetLocation
        result.newUrl = newUrl
        
        console.log(`✅ Reorganizado: ${ordinance.approval_number}/${ordinance.year}`)
        
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error con ${ordinance.approval_number}/${ordinance.year}:`, error)
      }
      
      results.push(result)
    }
    
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      notFound: results.filter(r => r.status === 'not_found').length,
    }
    
    return NextResponse.json({
      success: true,
      message: `Force reorganization ${dryRun ? 'preview' : 'completed'} for year ${year}`,
      summary,
      results: results.slice(0, 20)
    })

  } catch (error) {
    console.error('Error in force reorganization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to force reorganize files' },
      { status: 500 }
    )
  }
}