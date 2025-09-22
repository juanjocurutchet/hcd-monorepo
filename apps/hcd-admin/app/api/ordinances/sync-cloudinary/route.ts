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

interface SyncResult {
  publicId: string
  expectedFolder: string
  action: 'move' | 'skip' | 'error'
  newUrl?: string
  error?: string
}

// Obtener todos los archivos de la carpeta ordenanzas (sueltos)
async function getFilesInOrdenanzasRoot(): Promise<any[]> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ordenanzas/',
      max_results: 500,
      resource_type: 'raw'
    })
    
    // Filtrar solo archivos que están directamente en ordenanzas/ (no en subcarpetas)
    return result.resources.filter((file: any) => {
      const publicId = file.public_id
      // Si es "ordenanzas/ordenanza-XXXX" está suelto
      // Si es "ordenanzas/YYYY/ordenanza-XXXX" está en carpeta
      const parts = publicId.split('/')
      return parts.length === 2 && parts[0] === 'ordenanzas' && parts[1].startsWith('ordenanza-')
    })
  } catch (error) {
    console.error('Error getting Cloudinary files:', error)
    throw error
  }
}

// Extraer año del nombre del archivo
function extractYearFromPublicId(publicId: string): number | null {
  const match = publicId.match(/ordenanza-(\d+)-(\d{4})/)
  return match && match[2] ? parseInt(match[2]) : null
}

// Mover archivo a la carpeta correcta
async function moveToCorrectFolder(publicId: string, targetYear: number): Promise<string> {
  try {
    const newPublicId = `ordenanzas/${targetYear}/${publicId.split('/')[1]}`
    
    console.log(`📁 Moviendo: ${publicId} → ${newPublicId}`)
    
    const result = await cloudinary.uploader.rename(publicId, newPublicId, {
      resource_type: 'raw',
      overwrite: true
    })
    
    console.log(`✅ Movido: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error(`❌ Error moviendo ${publicId}:`, error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analizando archivos sueltos en Cloudinary...')
    
    // Obtener archivos sueltos de Cloudinary
    const looseFiles = await getFilesInOrdenanzasRoot()
    
    console.log(`📋 Encontrados ${looseFiles.length} archivos sueltos`)
    
    // Analizar archivos
    const analysis = looseFiles.map(file => {
      const publicId = file.public_id
      const year = extractYearFromPublicId(publicId)
      
      return {
        publicId,
        year,
        needsMove: year && (year === 2024 || year === 2025),
        size: file.bytes,
        format: file.format,
        created: file.created_at
      }
    })
    
    const needsMove = analysis.filter(f => f.needsMove)
    const byYear = needsMove.reduce((acc: any, file) => {
      const year = file.year!
      acc[year] = (acc[year] || 0) + 1
      return acc
    }, {})
    
    return NextResponse.json({
      message: "Cloudinary sync analysis completed",
      stats: {
        totalLooseFiles: looseFiles.length,
        needsMove: needsMove.length,
        byYear
      },
      sampleFiles: needsMove.slice(0, 10)
    })

  } catch (error) {
    console.error('Error in Cloudinary sync analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze Cloudinary sync' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { limit = 50, dryRun = false, year } = await request.json()
    
    console.log('🚀 Iniciando sincronización de Cloudinary...')
    
    // Obtener archivos sueltos
    const looseFiles = await getFilesInOrdenanzasRoot()
    
    // Filtrar archivos que necesitan moverse
    let filesToMove = looseFiles.filter(file => {
      const fileYear = extractYearFromPublicId(file.public_id)
      if (year) {
        return fileYear === parseInt(year)
      }
      return fileYear && (fileYear === 2024 || fileYear === 2025)
    }).slice(0, limit)
    
    console.log(`📦 Procesando ${filesToMove.length} archivos`)
    
    const results: SyncResult[] = []
    
    for (const file of filesToMove) {
      const publicId = file.public_id
      const targetYear = extractYearFromPublicId(publicId)!
      
      const result: SyncResult = {
        publicId,
        expectedFolder: `ordenanzas/${targetYear}`,
        action: 'error'
      }
      
      try {
        if (dryRun) {
          result.action = 'skip'
          result.newUrl = `[DRY RUN] Would move to: ordenanzas/${targetYear}/`
        } else {
          // Mover archivo
          const newUrl = await moveToCorrectFolder(publicId, targetYear)
          result.action = 'move'
          result.newUrl = newUrl
          
          // Actualizar DB si es necesario
          const approvalNumberMatch = publicId.match(/ordenanza-(\d+)-/)
          if (approvalNumberMatch) {
            const approvalNumber = parseInt(approvalNumberMatch[1])
            
            await db
              .update(ordinances)
              .set({ 
                file_url: newUrl,
                updated_at: new Date()
              })
              .where(and(
                eq(ordinances.approval_number, approvalNumber),
                eq(ordinances.year, targetYear)
              ))
          }
        }
      } catch (error) {
        result.action = 'error'
        result.error = error instanceof Error ? error.message : 'Unknown error'
      }
      
      results.push(result)
    }
    
    const summary = {
      total: results.length,
      moved: results.filter(r => r.action === 'move').length,
      errors: results.filter(r => r.action === 'error').length,
      skipped: results.filter(r => r.action === 'skip').length,
    }
    
    return NextResponse.json({
      success: true,
      message: `Cloudinary sync ${dryRun ? 'preview' : 'completed'}`,
      summary,
      results: dryRun ? results : results.slice(0, 20)
    })

  } catch (error) {
    console.error('Error in Cloudinary sync:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync Cloudinary files' },
      { status: 500 }
    )
  }
}