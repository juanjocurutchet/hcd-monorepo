#!/usr/bin/env tsx

/**
 * Script simplificado para importar ordenanzas faltantes
 * Enfoque: Solo metadatos, sin subida de archivos (por ahora)
 */

import { db } from '../lib/db-singleton'
import { ordinances } from '../lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

interface OrdinanceData {
  approvalNumber: number
  title: string
  year: number
  type: string
  category: string
  fileName: string
}

// Mapeo simplificado de tipos
const getType = (title: string): string => {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('fiscal') || titleLower.includes('presupuesto')) return 'Finanzas'
  if (titleLower.includes('convenio') || titleLower.includes('licitacion')) return 'Convenios Ejecutivo'
  if (titleLower.includes('modif') || titleLower.includes('creacion')) return 'Reglamentaciones'
  if (titleLower.includes('adhesion')) return 'Convenios Ejecutivo'
  
  return 'Convenios Ejecutivo' // Por defecto
}

const getCategory = (title: string): string => {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('fiscal') || titleLower.includes('presupuesto')) return 'Economia municipal'
  if (titleLower.includes('educacion') || titleLower.includes('cultura')) return 'Educación cultura'
  if (titleLower.includes('salud') || titleLower.includes('deporte')) return 'Salud deportes'
  if (titleLower.includes('ambiente') || titleLower.includes('ecologia')) return 'Medio ambiente ecologia'
  if (titleLower.includes('obra') || titleLower.includes('construccion')) return 'obra publica'
  if (titleLower.includes('empresa') || titleLower.includes('desarrollo')) return 'Desarrollo local'
  if (titleLower.includes('seguridad') || titleLower.includes('transito')) return 'Seguridad'
  
  return 'Institucional' // Por defecto
}

function extractOrdinanceData(fileName: string, year: number): OrdinanceData | null {
  const match = fileName.match(/Ordenanza\s+(\d+)\.?\s*(.+)/i)
  if (!match) return null

  const approvalNumber = parseInt(match[1] || "0")
  let title = match[2] || ""
    .replace(/\.(docx?|pdf|xlsx?)$/i, '')
    .replace(/^\s*[-.]?\s*/, '')
    .trim()

  title = title.charAt(0).toUpperCase() + title.slice(1)

  return {
    approvalNumber,
    title,
    year,
    type: getType(title),
    category: getCategory(title),
    fileName
  }
}

async function importFromDirectory(dirPath: string, year: number): Promise<number> {
  console.log(`📁 Procesando: ${dirPath} (${year})`)
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directorio no existe: ${dirPath}`)
    return 0
  }

  const files = fs.readdirSync(dirPath)
    .filter(file => /^Ordenanza\s+\d+/i.test(file))
    .filter(file => /\.(docx?|pdf|xlsx?)$/i.test(file))
    .sort()

  console.log(`📋 Encontrados ${files.length} archivos`)

  let imported = 0
  
  for (const file of files) {
    const ordinanceData = extractOrdinanceData(file, year)
    if (!ordinanceData) continue

    try {
      // Verificar si ya existe
      const existing = await db
        .select()
        .from(ordinances)
        .where(eq(ordinances.approval_number, ordinanceData.approvalNumber))
        .limit(1)

      if (existing.length > 0) {
        console.log(`⏭️  ${ordinanceData.approvalNumber} ya existe`)
        continue
      }

      // Insertar nueva ordenanza
      const slug = `ordenanza-${ordinanceData.approvalNumber}-${ordinanceData.year}`
      
      await db.insert(ordinances).values({
        approval_number: ordinanceData.approvalNumber,
        title: ordinanceData.title,
        year: ordinanceData.year,
        type: ordinanceData.type,
        category: ordinanceData.category,
        notes: `Archivo: ${ordinanceData.fileName}`,
        is_active: true,
        file_url: null, // Por ahora sin archivo
        slug: slug,
        created_at: new Date(),
        updated_at: new Date()
      })

      console.log(`✅ ${ordinanceData.approvalNumber}/${year} - ${ordinanceData.title}`)
      imported++

    } catch (error) {
      console.error(`❌ Error en ${ordinanceData.approvalNumber}:`, error)
    }
  }

  return imported
}

async function main() {
  console.log('🚀 Importando ordenanzas faltantes...')
  console.log(`📅 ${new Date().toLocaleString('es-ES')}`)

  const baseDir = '/home/juan/Downloads/Concejo'
  let totalImported = 0

  try {
    // Verificar estado actual
    const currentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)
    
    console.log(`📊 Ordenanzas actuales en DB: ${currentCount[0]?.count || 0}`)

    // Importar por año
    totalImported += await importFromDirectory(path.join(baseDir, 'Ordenanzas-2023'), 2023)
    totalImported += await importFromDirectory(path.join(baseDir, 'Ordenanzas-2024'), 2024)
    totalImported += await importFromDirectory(path.join(baseDir, 'Ordenanzas-2025'), 2025)

    // Verificar resultado final
    const finalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)

    console.log(`\n✅ Importación completada`)
    console.log(`📈 Ordenanzas importadas: ${totalImported}`)
    console.log(`📊 Total final en DB: ${finalCount[0]?.count || 0}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log('🏁 Finalizado')
}

main()