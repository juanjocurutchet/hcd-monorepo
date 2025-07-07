import { db } from "@/lib/db-singleton"
import { commissionFiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await db
      .select()
      .from(commissionFiles)
      .where(eq(commissionFiles.committeeId, id))
      .orderBy(commissionFiles.fechaEntrada)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching committee files:", error)
    return NextResponse.json({ error: "Error al obtener los archivos de la comisión" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const [newFile] = await db
      .insert(commissionFiles)
      .values({ ...body, committeeId: id })
      .returning()

    return NextResponse.json(newFile)
  } catch (error) {
    console.error("Error creating committee file:", error)
    return NextResponse.json({ error: "Error al crear el archivo de la comisión" }, { status: 500 })
  }
}