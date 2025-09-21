import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
})

export async function POST(request: NextRequest) {
  try {
    const { year } = await request.json()
    
    if (!year || (year !== 2024 && year !== 2025)) {
      return NextResponse.json(
        { error: 'Year must be 2024 or 2025' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 Refrescando interfaz de Cloudinary para año ${year}`)
    
    // Asegurar que la carpeta existe
    try {
      await cloudinary.api.create_folder(`ordenanzas/${year}`)
      console.log(`📂 Carpeta ordenanzas/${year} asegurada`)
    } catch (error: any) {
      if (error.http_code !== 400) {
        console.log(`⚠️ Advertencia al crear carpeta: ${error.message}`)
      }
    }
    
    // Obtener todos los archivos del año para forzar cache refresh
    const files = await cloudinary.api.resources({
      type: 'upload',
      prefix: `ordenanzas/${year}/`,
      max_results: 500,
      resource_type: 'raw'
    })
    
    console.log(`📁 Encontrados ${files.resources.length} archivos en ordenanzas/${year}/`)
    
    // Obtener info de la carpeta
    const folderInfo = await cloudinary.api.sub_folders('ordenanzas')
    const yearFolder = folderInfo.folders.find((f: any) => f.name === year.toString())
    
    return NextResponse.json({
      success: true,
      message: `Cloudinary refresh completed for year ${year}`,
      folderExists: !!yearFolder,
      filesFound: files.resources.length,
      sampleFiles: files.resources.slice(0, 5).map((f: any) => ({
        publicId: f.public_id,
        url: f.secure_url,
        size: f.bytes,
        created: f.created_at
      })),
      suggestion: files.resources.length > 0 ? 
        "Los archivos existen en la API. Prueba refrescar la página de Cloudinary (F5) o cambiar a vista de lista." :
        "No se encontraron archivos. Puede que necesiten reorganización."
    })

  } catch (error) {
    console.error('Error refreshing Cloudinary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh Cloudinary' },
      { status: 500 }
    )
  }
}