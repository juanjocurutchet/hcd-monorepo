import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando contenido de carpetas de ordenanzas...')
    
    // Verificar carpeta 2024
    const files2024 = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ordenanzas/2024/',
      max_results: 100,
      resource_type: 'raw'
    })
    
    // Verificar carpeta 2025
    const files2025 = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ordenanzas/2025/',
      max_results: 100,
      resource_type: 'raw'
    })
    
    // Verificar archivos sueltos en ordenanzas/ (no en subcarpetas)
    const allOrdenanzas = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ordenanzas/',
      max_results: 500,
      resource_type: 'raw'
    })
    
    const looseFiles = allOrdenanzas.resources.filter((file: any) => {
      const publicId = file.public_id
      const parts = publicId.split('/')
      // Archivo suelto: "ordenanzas/ordenanza-XXXX"
      // Archivo en carpeta: "ordenanzas/YYYY/ordenanza-XXXX"
      return parts.length === 2 && parts[0] === 'ordenanzas'
    })
    
    // Verificar carpetas existentes
    const folders = await cloudinary.api.sub_folders('ordenanzas')
    
    return NextResponse.json({
      message: "Folder check completed",
      folders: folders.folders.map((f: any) => f.name),
      files2024: {
        count: files2024.resources.length,
        samples: files2024.resources.slice(0, 5).map((f: any) => ({
          publicId: f.public_id,
          size: f.bytes,
          format: f.format
        }))
      },
      files2025: {
        count: files2025.resources.length,
        samples: files2025.resources.slice(0, 5).map((f: any) => ({
          publicId: f.public_id,
          size: f.bytes,
          format: f.format
        }))
      },
      looseFiles: {
        count: looseFiles.length,
        samples: looseFiles.slice(0, 10).map((f: any) => ({
          publicId: f.public_id,
          size: f.bytes,
          format: f.format
        }))
      }
    })

  } catch (error) {
    console.error('Error checking folders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check folders' },
      { status: 500 }
    )
  }
}