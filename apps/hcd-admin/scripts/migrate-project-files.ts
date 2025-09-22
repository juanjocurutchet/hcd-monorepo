import { v2 as cloudinary } from "cloudinary"
import { db } from "../lib/db-singleton"
import { sessionFiles } from "../lib/db/schema"
import { eq, sql } from "drizzle-orm"

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
})

interface ProjectFile {
  id: number
  fileUrl: string | null
  origen: string
  autor: string | null
  fechaEntrada: Date
}

async function moveFileToNewStructure(fileUrl: string, origen: string, autor: string, fechaEntrada: Date): Promise<string> {
  try {
    // Extraer el public_id del URL de Cloudinary
    const urlParts = fileUrl.split('/')
    const fileWithExtension = urlParts[urlParts.length - 1]
    const fileName = fileWithExtension ? fileWithExtension.split('.')[0] : 'unknown'
    
    // Encontrar el folder actual del archivo
    const uploadIndex = urlParts.indexOf('upload')
    const versionPart = urlParts[uploadIndex + 1]
    const versionIndex = versionPart ? urlParts.indexOf('v' + versionPart.substring(1)) : -1
    const currentFolderParts = urlParts.slice(versionIndex + 1, -1)
    const currentPublicId = [...currentFolderParts, fileName].join('/')

    // Crear la nueva estructura de carpetas
    const year = new Date(fechaEntrada).getFullYear()
    const newFolderPath = `Proyectos/${year}/${origen}/${autor}`
    const newPublicId = `${newFolderPath}/${fileName}`

    console.log(`Moviendo archivo de ${currentPublicId} a ${newPublicId}`)

    // Hacer una copia del archivo en la nueva ubicación
    const result = await cloudinary.uploader.upload(fileUrl, {
      public_id: newPublicId,
      resource_type: "auto",
      overwrite: false
    })

    // Si la copia fue exitosa, eliminar el archivo original
    if (result.secure_url) {
      try {
        await cloudinary.uploader.destroy(currentPublicId, { resource_type: "auto" })
        console.log(`Archivo original eliminado: ${currentPublicId}`)
      } catch (deleteError) {
        console.warn(`No se pudo eliminar el archivo original: ${currentPublicId}`, deleteError)
      }
    }

    return result.secure_url
  } catch (error) {
    console.error(`Error moviendo archivo ${fileUrl}:`, error)
    throw error
  }
}

async function migrateProjectFiles() {
  try {
    console.log("Iniciando migración de archivos de proyectos...")

    // Obtener todos los archivos de sesión que tienen fileUrl
    const projectFiles = await db
      .select({
        id: sessionFiles.id,
        fileUrl: sessionFiles.fileUrl,
        origen: sessionFiles.origen,
        autor: sessionFiles.autor,
        fechaEntrada: sessionFiles.fechaEntrada
      })
      .from(sessionFiles)
      .where(sql`${sessionFiles.fileUrl} IS NOT NULL AND ${sessionFiles.fileUrl} != ''`)

    console.log(`Encontrados ${projectFiles.length} archivos para migrar`)

    let migratedCount = 0
    let errorCount = 0

    for (const project of projectFiles) {
      if (!project.fileUrl || !project.autor) {
        console.log(`Saltando proyecto ID ${project.id} - falta fileUrl o autor`)
        continue
      }

      try {
        console.log(`\nMigrando archivo para proyecto ID ${project.id}...`)
        
        // Verificar si el archivo ya está en la estructura correcta
        const year = new Date(project.fechaEntrada).getFullYear()
        const expectedPath = `Proyectos/${year}/${project.origen}/${project.autor}`
        
        if (project.fileUrl.includes(expectedPath)) {
          console.log(`Archivo ya está en la estructura correcta: ${project.fileUrl}`)
          continue
        }

        const newFileUrl = await moveFileToNewStructure(
          project.fileUrl,
          project.origen,
          project.autor,
          project.fechaEntrada
        )

        // Actualizar la URL en la base de datos
        await db
          .update(sessionFiles)
          .set({ fileUrl: newFileUrl })
          .where(eq(sessionFiles.id, project.id))

        console.log(`✅ Archivo migrado exitosamente para proyecto ID ${project.id}`)
        console.log(`   URL anterior: ${project.fileUrl}`)
        console.log(`   URL nueva: ${newFileUrl}`)
        
        migratedCount++

        // Pequeña pausa para evitar saturar la API de Cloudinary
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`❌ Error migrando archivo para proyecto ID ${project.id}:`, error)
        errorCount++
      }
    }

    console.log(`\n🎉 Migración completada!`)
    console.log(`   Archivos migrados: ${migratedCount}`)
    console.log(`   Errores: ${errorCount}`)
    console.log(`   Total procesados: ${projectFiles.length}`)

  } catch (error) {
    console.error("Error en la migración:", error)
    process.exit(1)
  }
}

// Ejecutar la migración
if (require.main === module) {
  migrateProjectFiles()
    .then(() => {
      console.log("Script de migración finalizado")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Error ejecutando migración:", error)
      process.exit(1)
    })
}

export { migrateProjectFiles }