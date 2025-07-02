import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/utils/server-utils"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { parse } from "csv-parse/sync"

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const csvFile = formData.get("csv") as File
    const authorId = Number.parseInt(formData.get("authorId") as string)

    if (!csvFile || !csvFile.name.endsWith(".csv") || isNaN(authorId)) {
      return NextResponse.json({ error: "Se requiere un archivo CSV válido y un ID de autor" }, { status: 400 })
    }

    // Leer el archivo CSV
    const csvBuffer = await csvFile.arrayBuffer()
    const csvText = new TextDecoder().decode(csvBuffer)

    // Parsear el CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Recopilar todos los archivos PDF subidos
    const pdfFiles: { [key: string]: File } = {}
    const pdfEntries = Array.from(formData.entries()).filter(([key]) => key === "pdfs")

    for (const [_, file] of pdfEntries) {
      if (file instanceof File) {
        pdfFiles[file.name] = file
      }
    }

    // Procesar cada registro
    const results = {
      total: records.length,
      successful: 0,
      failed: 0,
      errors: [] as { document: string; message: string }[],
    }

    for (const record of records) {
      try {
        // Validar campos requeridos
        if (!record.title || !record.type) {
          throw new Error("Faltan campos requeridos (título o tipo)")
        }

        // Validar tipo de documento
        const validTypes = ["ordenanza", "decreto", "resolucion", "comunicacion"]
        if (!validTypes.includes(record.type)) {
          throw new Error(`Tipo de documento inválido: ${record.type}`)
        }

        let fileUrl = null

        // Procesar archivo PDF si existe
        if (record.pdfPath) {
          const fileName = record.pdfPath.split("/").pop()
          const pdfFile = pdfFiles[fileName]

          if (pdfFile) {
            fileUrl = await uploadFile(pdfFile, `documents/${record.type}`)
          } else {
            console.warn(`Archivo no encontrado: ${fileName}`)
          }
        }

        // Insertar en la base de datos
        await db.insert(documents).values({
          title: record.title,
          number: record.number || null,
          type: record.type,
          content: record.content || "",
          fileUrl,
          publishedAt: record.publishedAt ? new Date(record.publishedAt) : new Date(),
          authorId,
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        results.successful++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          document: record.number || record.title,
          message: error.message,
        })
        console.error(`Error al procesar documento ${record.number || record.title}:`, error)
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error en la importación masiva:", error)
    return NextResponse.json({ error: error.message || "Error al procesar la importación" }, { status: 500 })
  }
}
