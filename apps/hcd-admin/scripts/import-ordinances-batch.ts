#!/usr/bin/env tsx

/**
 * Script para importar ordenanzas faltantes desde archivos locales
 * Importa ordenanzas 2023 (3482-3560), 2024 (3561-3631), 2025 (3632-3659)
 */

import fs from 'fs'
import path from 'path'
import { db } from '../lib/db-singleton'
import { ordinances } from '../lib/db/schema'
import { uploadFile } from '../lib/storage'

interface OrdinanceData {
  approvalNumber: number
  title: string
  year: number
  type: string
  category: string
  notes?: string
  filePath: string
  fileName: string
}

// Mapeo de tipos comunes encontrados en los nombres de archivos
const TYPE_MAPPING: { [key: string]: string } = {
  'fiscal': 'Finanzas',
  'presupuesto': 'Finanzas', 
  'convenio': 'Convenios Ejecutivo',
  'licitacion': 'Convenios Ejecutivo',
  'modif': 'Reglamentaciones',
  'adhesion': 'Convenios Ejecutivo',
  'programa': 'Convenios Ejecutivo',
  'creacion': 'Reglamentaciones',
  'donacion': 'Convenios Ejecutivo',
  'compensacion': 'Finanzas',
  'condonacion': 'Finanzas',
  'incremento': 'Finanzas',
  'moratoria': 'Finanzas',
  'emergencia': 'Servicios públicos',
  'construccion': 'Convenios Ejecutivo',
  'mantenimiento': 'Convenios Ejecutivo',
  'ambulancia': 'Convenios Ejecutivo',
  'energia': 'Convenios Ejecutivo',
  'iluminacion': 'Convenios Ejecutivo',
  'asfalto': 'Convenios Ejecutivo',
  'pavimento': 'Convenios Ejecutivo',
  'limpieza': 'Convenios Ejecutivo',
  'empresa': 'Desarrollo local',
  'terreno': 'Desarrollo local',
  'nombre': 'Institucional',
  'imposicion': 'Institucional'
}

const CATEGORY_MAPPING: { [key: string]: string } = {
  'fiscal': 'Economia municipal',
  'presupuesto': 'Economia municipal',
  'convenio': 'Institucional',
  'educacion': 'Educación cultura',
  'salud': 'Salud deportes',
  'ambiente': 'Medio ambiente ecologia',
  'obra': 'obra publica',
  'empresa': 'Desarrollo local',
  'turismo': 'Desarrollo local',
  'cultura': 'Educación cultura',
  'deporte': 'Salud deportes',
  'seguridad': 'Seguridad',
  'transito': 'Seguridad'
}

function extractOrdinanceInfo(fileName: string, year: number): OrdinanceData | null {
  // Extraer número de ordenanza del formato "Ordenanza 3XXX."
  const numberMatch = fileName.match(/Ordenanza\s+(\d+)\.?\s*(.+)/i)
  if (!numberMatch) {
    console.warn(`No se pudo extraer número de ordenanza de: ${fileName}`)
    return null
  }

  const approvalNumber = parseInt(numberMatch[1] || "0")
  let title = numberMatch[2] || ""

  // Limpiar título
  title = title
    .replace(/\.(docx?|pdf|xlsx?)$/i, '') // Quitar extensión
    .replace(/^\s*[-.]?\s*/, '') // Quitar guiones y puntos al inicio
    .trim()

  // Capitalizar primera letra
  title = title.charAt(0).toUpperCase() + title.slice(1)

  // Determinar tipo basado en palabras clave
  let type = 'Convenios Ejecutivo' // Tipo por defecto
  const titleLower = title.toLowerCase()
  
  for (const [keyword, mappedType] of Object.entries(TYPE_MAPPING)) {
    if (titleLower.includes(keyword)) {
      type = mappedType
      break
    }
  }

  // Determinar categoría
  let category = 'Institucional' // Categoría por defecto
  for (const [keyword, mappedCategory] of Object.entries(CATEGORY_MAPPING)) {
    if (titleLower.includes(keyword)) {
      category = mappedCategory
      break
    }
  }

  return {
    approvalNumber,
    title,
    year,
    type,
    category,
    fileName
  } as OrdinanceData
}

async function processOrdinanceFile(ordinanceData: OrdinanceData, filePath: string): Promise<void> {
  try {
    console.log(`📄 Procesando: Ordenanza ${ordinanceData.approvalNumber}/${ordinanceData.year}`)

    // Verificar si ya existe
    const existing = await db
      .select()
      .from(ordinances)
      .where(eq(ordinances.approval_number, ordinanceData.approvalNumber))
      .limit(1)

    if (existing.length > 0) {
      console.log(`⚠️  Ordenanza ${ordinanceData.approvalNumber} ya existe, saltando...`)
      return
    }

    // Leer archivo y subir a Cloudinary
    let fileUrl: string | null = null
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath)
      const fileExtension = path.extname(filePath)
      
      // Crear un archivo temporal para la subida
      const tempFile = new File([fileBuffer], ordinanceData.fileName, {
        type: fileExtension === '.pdf' ? 'application/pdf' : 
              fileExtension === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              fileExtension === '.doc' ? 'application/msword' :
              fileExtension === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'application/octet-stream'
      })

      try {
        fileUrl = await uploadFile(tempFile, 'ordenanzas')
        console.log(`✅ Archivo subido: ${fileUrl}`)
      } catch (uploadError) {
        console.warn(`⚠️  Error subiendo archivo para ordenanza ${ordinanceData.approvalNumber}:`, uploadError)
      }
    }

    // Generar slug
    const slug = `ordenanza-${ordinanceData.approvalNumber}-${ordinanceData.year}`

    // Insertar en base de datos
    await db.insert(ordinances).values({
      approval_number: ordinanceData.approvalNumber,
      title: ordinanceData.title,
      year: ordinanceData.year,
      type: ordinanceData.type,
      category: ordinanceData.category,
      notes: `Importada automáticamente desde archivo: ${ordinanceData.fileName}`,
      is_active: true,
      file_url: fileUrl,
      slug: slug,
      created_at: new Date(),
      updated_at: new Date()
    })

    console.log(`✅ Ordenanza ${ordinanceData.approvalNumber}/${ordinanceData.year} importada exitosamente`)

  } catch (error) {
    console.error(`❌ Error procesando ordenanza ${ordinanceData.approvalNumber}:`, error)
  }
}

async function importOrdinancesFromDirectory(dirPath: string, year: number): Promise<void> {
  console.log(`\n📁 Procesando directorio: ${dirPath} (Año ${year})`)
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directorio no encontrado: ${dirPath}`)
    return
  }

  const files = fs.readdirSync(dirPath)
    .filter(file => /\.docx?$|\.pdf$|\.xlsx?$/i.test(file))
    .filter(file => /^Ordenanza\s+\d+/i.test(file))
    .sort()

  console.log(`📋 Encontrados ${files.length} archivos de ordenanzas`)

  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const ordinanceData = extractOrdinanceInfo(file, year)
    
    if (ordinanceData) {
      await processOrdinanceFile(ordinanceData, filePath)
      // Pequeña pausa para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

async function main() {
  console.log('🚀 Iniciando importación masiva de ordenanzas...')
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`)

  const baseDir = '/home/juan/Downloads/Concejo'
  let totalImported = 0

  try {
    // Importar año 2023 (ordenanzas faltantes)
    await importOrdinancesFromDirectory(path.join(baseDir, 'Ordenanzas-2023'), 2023)
    
    // Importar año 2024 
    await importOrdinancesFromDirectory(path.join(baseDir, 'Ordenanzas-2024'), 2024)
    
    // Importar año 2025
    await importOrdinancesFromDirectory(path.join(baseDir, 'Ordenanzas-2025'), 2025)

    // Contar total importado
    const totalCount = await db.select({ count: sql<number>`count(*)` }).from(ordinances)
    console.log(`\n✅ Importación completada`)
    console.log(`📊 Total de ordenanzas en la base de datos: ${totalCount[0]?.count || 0}`)
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error)
    process.exit(1)
  }

  console.log('🏁 Script finalizado')
}

// Importar módulos necesarios
import { eq, sql } from 'drizzle-orm'

// Ejecutar el script
main()