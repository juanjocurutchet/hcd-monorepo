import { db } from "@/lib/db-singleton"
import { ordinances } from "@/lib/db/schema"
import { eq, isNull, isNotNull, sql, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary exactamente igual que en lib/storage.ts
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
})

interface UploadResult {
  ordinanceId: number
  approvalNumber: number
  fileName: string
  status: 'success' | 'error' | 'not_found' | 'already_uploaded'
  url?: string
  error?: string
}

// Función que crea carpetas físicas en Cloudinary y sube archivos
async function uploadFileToCloudinary(filePath: string, folder: string, publicId: string): Promise<string> {
  try {
    console.log(`📁 Iniciando subida: ${path.basename(filePath)} → ${folder}/${publicId}`)

    // Asegurar que la carpeta existe antes de subir
    try {
      await cloudinary.api.create_folder(folder)
      console.log(`📂 Carpeta asegurada: ${folder}`)
    } catch (folderError: any) {
      // Si la carpeta ya existe, continúa (error 400 es normal)
      if (folderError.http_code !== 400) {
        console.log(`⚠️ Advertencia al crear carpeta: ${folderError.message}`)
      }
    }

    return new Promise((resolve, reject) => {
      const options: any = {
        folder: folder,
        public_id: publicId,
        resource_type: "auto",
        use_filename: false,
        unique_filename: false,
        overwrite: true,
      }
      
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error("❌ Error en Cloudinary:", error)
            reject(error)
            return
          }
          if (result) {
            console.log("✅ Archivo subido exitosamente:", result.secure_url)
            console.log("🏷️ Public ID:", result.public_id)
            resolve(result.secure_url)
          } else {
            reject(new Error("No se recibió resultado de Cloudinary"))
          }
        },
      )

      // Leer archivo y enviarlo al stream
      const fileBuffer = fs.readFileSync(filePath)
      uploadStream.end(fileBuffer)
    })
  } catch (error) {
    console.error("❌ Error al subir archivo a Cloudinary:", error)
    throw error
  }
}

function findOrdinanceFile(baseDir: string, year: number, approvalNumber: number): string | null {
  const yearDir = path.join(baseDir, `Ordenanzas-${year}`)
  
  if (!fs.existsSync(yearDir)) {
    return null
  }

  const files = fs.readdirSync(yearDir)
  
  // Buscar archivo que coincida con el número de ordenanza
  const matchingFile = files.find(file => {
    const match = file.match(/Ordenanza\s+(\d+)/i)
    return match && match[1] && parseInt(match[1]) === approvalNumber
  })

  return matchingFile ? path.join(yearDir, matchingFile) : null
}

async function uploadOrdinanceFiles(
  year?: number, 
  limit = 10, 
  skipExisting = true
): Promise<UploadResult[]> {
  
  const baseDir = '/home/juan/Downloads/Concejo'
  const results: UploadResult[] = []

  // Consultar ordenanzas sin file_url o de un año específico
  const whereConditions = []
  
  if (year) {
    whereConditions.push(eq(ordinances.year, year))
  }
  
  if (skipExisting) {
    // Solo ordenanzas sin URL de archivo
    whereConditions.push(isNull(ordinances.file_url))
  }

  const ordinancesToProcess = await db
    .select()
    .from(ordinances)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(limit)
    .orderBy(ordinances.year, ordinances.approval_number)

  console.log(`📁 Processing ${ordinancesToProcess.length} ordinances`)

  for (const ordinance of ordinancesToProcess) {
    const result: UploadResult = {
      ordinanceId: ordinance.id,
      approvalNumber: ordinance.approval_number,
      fileName: `Ordenanza ${ordinance.approval_number}`,
      status: 'error'
    }

    try {
      // Buscar archivo físico
      const filePath = findOrdinanceFile(baseDir, ordinance.year, ordinance.approval_number)
      
      if (!filePath || !fs.existsSync(filePath)) {
        result.status = 'not_found'
        result.error = 'Archivo físico no encontrado'
        results.push(result)
        continue
      }

      result.fileName = path.basename(filePath)

      // Verificar si ya tiene URL (en caso de no skipExisting)
      if (ordinance.file_url && skipExisting) {
        result.status = 'already_uploaded'
        result.url = ordinance.file_url
        results.push(result)
        continue
      }

      // Generar public_id para Cloudinary con estructura correcta (igual que la API manual)
      const fileExtension = path.extname(filePath).substring(1)
      const publicId = `ordenanza-${ordinance.approval_number}-${ordinance.year}.${fileExtension}`
      const folder = `ordenanzas/${ordinance.year}`

      // Usar función que replica exactamente la lógica de lib/storage.ts
      const cloudinaryUrl = await uploadFileToCloudinary(filePath, folder, publicId)

      // Actualizar base de datos
      await db
        .update(ordinances)
        .set({ 
          file_url: cloudinaryUrl,
          updated_at: new Date()
        })
        .where(eq(ordinances.id, ordinance.id))

      result.status = 'success'
      result.url = cloudinaryUrl

      console.log(`✅ ${ordinance.approval_number}/${ordinance.year}: ${cloudinaryUrl}`)

    } catch (error) {
      result.status = 'error'
      result.error = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Error processing ${ordinance.approval_number}:`, error)
    }

    results.push(result)

    // Pequeña pausa para no sobrecargar Cloudinary
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const { year, limit = 20, skipExisting = true, dryRun = false } = await request.json()

    if (dryRun) {
      // Solo mostrar qué se subiría
      const whereConditions = [isNull(ordinances.file_url)]

      if (year) {
        whereConditions.push(eq(ordinances.year, parseInt(year)))
      }

      const toProcess = await db
        .select()
        .from(ordinances)
        .where(and(...whereConditions))
        .limit(limit)
      
      return NextResponse.json({
        dryRun: true,
        message: `${toProcess.length} ordinances would be processed`,
        ordinances: toProcess.map(o => ({
          id: o.id,
          approval_number: o.approval_number,
          year: o.year,
          title: o.title
        }))
      })
    }

    const results = await uploadOrdinanceFiles(year, limit, skipExisting)

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      not_found: results.filter(r => r.status === 'not_found').length,
      already_uploaded: results.filter(r => r.status === 'already_uploaded').length
    }

    return NextResponse.json({
      success: true,
      message: 'File upload process completed',
      summary,
      results
    })

  } catch (error) {
    console.error('Upload process error:', error)
    return NextResponse.json({
      success: false,
      error: 'Upload process failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const year = url.searchParams.get('year')

    // Estadísticas de archivos subidos vs no subidos
    const totalOrdinances = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)

    const withFiles = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)
      .where(isNotNull(ordinances.file_url))

    const withoutFiles = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)
      .where(isNull(ordinances.file_url))

    // Por año
    const byYear = await db
      .select({
        year: ordinances.year,
        total: sql<number>`count(*)`,
        with_files: sql<number>`count(file_url)`,
      })
      .from(ordinances)
      .groupBy(ordinances.year)
      .orderBy(ordinances.year)

    return NextResponse.json({
      statistics: {
        total: totalOrdinances[0]?.count || 0,
        with_files: withFiles[0]?.count || 0,
        without_files: withoutFiles[0]?.count || 0,
        by_year: byYear
      },
      upload_ready: true
    })

  } catch (error) {
    console.error('Error getting upload statistics:', error)
    return NextResponse.json({
      error: 'Failed to get upload statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}