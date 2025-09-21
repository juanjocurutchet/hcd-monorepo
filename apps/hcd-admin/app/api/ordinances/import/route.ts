import { db } from "@/lib/db-singleton"
import { ordinances } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
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
  
  return 'Convenios Ejecutivo'
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
  
  return 'Institucional'
}

function extractOrdinanceData(fileName: string, year: number): OrdinanceData | null {
  const match = fileName.match(/Ordenanza\s+(\d+)\.?\s*(.+)/i)
  if (!match) return null

  const approvalNumber = parseInt(match[1])
  let title = match[2]
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

async function importFromDirectory(dirPath: string, year: number): Promise<{ imported: number; skipped: number; errors: string[] }> {
  console.log(`Processing directory: ${dirPath} (${year})`)
  
  if (!fs.existsSync(dirPath)) {
    return { imported: 0, skipped: 0, errors: [`Directory not found: ${dirPath}`] }
  }

  const files = fs.readdirSync(dirPath)
    .filter(file => /^Ordenanza\s+\d+/i.test(file))
    .filter(file => /\.(docx?|pdf|xlsx?)$/i.test(file))
    .sort()

  let imported = 0
  let skipped = 0
  const errors: string[] = []
  
  for (const file of files) {
    const ordinanceData = extractOrdinanceData(file, year)
    if (!ordinanceData) {
      errors.push(`Could not parse: ${file}`)
      continue
    }

    try {
      // Check if already exists
      const existing = await db
        .select()
        .from(ordinances)
        .where(eq(ordinances.approval_number, ordinanceData.approvalNumber))
        .limit(1)

      if (existing.length > 0) {
        console.log(`Ordinance ${ordinanceData.approvalNumber} already exists`)
        skipped++
        continue
      }

      // Insert new ordinance
      const slug = `ordenanza-${ordinanceData.approvalNumber}-${ordinanceData.year}`
      
      await db.insert(ordinances).values({
        approval_number: ordinanceData.approvalNumber,
        title: ordinanceData.title,
        year: ordinanceData.year,
        type: ordinanceData.type,
        category: ordinanceData.category,
        notes: `Archivo: ${ordinanceData.fileName}`,
        is_active: true,
        file_url: null,
        slug: slug,
        created_at: new Date(),
        updated_at: new Date()
      })

      console.log(`Imported: ${ordinanceData.approvalNumber}/${year}`)
      imported++

    } catch (error) {
      const errorMsg = `Error importing ${ordinanceData.approvalNumber}: ${error}`
      console.error(errorMsg)
      errors.push(errorMsg)
    }
  }

  return { imported, skipped, errors }
}

export async function POST(request: NextRequest) {
  try {
    const { year, dryRun = false } = await request.json()

    const baseDir = '/home/juan/Downloads/Concejo'
    let totalImported = 0
    let totalSkipped = 0
    let allErrors: string[] = []

    // Get current count
    const currentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)
    
    const initialCount = currentCount[0]?.count || 0

    if (dryRun) {
      return NextResponse.json({
        message: "Dry run completed - no changes made",
        initialCount,
        totalImported: 0,
        totalSkipped: 0,
        errors: []
      })
    }

    // Import by year or all years
    if (year) {
      const yearDir = `Ordenanzas-${year}`
      const result = await importFromDirectory(path.join(baseDir, yearDir), parseInt(year))
      totalImported += result.imported
      totalSkipped += result.skipped
      allErrors.push(...result.errors)
    } else {
      // Import all years
      for (const importYear of [2023, 2024, 2025]) {
        const yearDir = `Ordenanzas-${importYear}`
        const result = await importFromDirectory(path.join(baseDir, yearDir), importYear)
        totalImported += result.imported
        totalSkipped += result.skipped
        allErrors.push(...result.errors)
      }
    }

    // Get final count
    const finalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)

    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      initialCount,
      finalCount: finalCount[0]?.count || 0,
      totalImported,
      totalSkipped,
      errors: allErrors
    })

  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({
      success: false,
      error: "Import failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get current ordinance statistics
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(ordinances)

    const by_year = await db
      .select({ 
        year: ordinances.year,
        count: sql<number>`count(*)` 
      })
      .from(ordinances)
      .groupBy(ordinances.year)
      .orderBy(ordinances.year)

    // Check what files are available for import
    const baseDir = '/home/juan/Downloads/Concejo'
    const availableFiles = {
      2023: 0,
      2024: 0,
      2025: 0
    }

    for (const year of [2023, 2024, 2025]) {
      const dirPath = path.join(baseDir, `Ordenanzas-${year}`)
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath)
          .filter(file => /^Ordenanza\s+\d+/i.test(file))
          .filter(file => /\.(docx?|pdf|xlsx?)$/i.test(file))
        availableFiles[year as keyof typeof availableFiles] = files.length
      }
    }

    return NextResponse.json({
      current_statistics: {
        total: total[0]?.count || 0,
        by_year: by_year
      },
      available_for_import: availableFiles,
      import_ready: true
    })

  } catch (error) {
    console.error("Error getting import status:", error)
    return NextResponse.json({
      error: "Failed to get import status",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}