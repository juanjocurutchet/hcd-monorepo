import { db } from "@/lib/db-singleton"
import { councilMembers } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await db.select().from(councilMembers).where(eq(councilMembers.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Concejal no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching council member:", error)
    return NextResponse.json({ error: "Error al obtener el concejal" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    let updateData: any = {}

    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      // Parsear campos planos
      for (const [key, value] of formData.entries()) {
        if (key === "image" && typeof value === "object" && "arrayBuffer" in value && value.size > 0) {
          // Subida real a Cloudinary
          const imageUrl = await uploadFile(value, "council-members")
          updateData.imageUrl = imageUrl
        } else if (key === "isActive") {
          // Checkbox: puede venir como "true" o "false"
          updateData.isActive = value === "true"
        } else if (key === "blockId") {
          // Puede venir como "-1" para sin bloque
          updateData.blockId = value === "-1" ? null : Number(value)
        } else {
          updateData[key] = value
        }
      }
    } else {
      updateData = await request.json()
    }

    const [updatedMember] = await db
      .update(councilMembers)
      .set(updateData)
      .where(eq(councilMembers.id, id))
      .returning()

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating council member:", error)
    return NextResponse.json({ error: "Error al actualizar el concejal" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await db.delete(councilMembers).where(eq(councilMembers.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting council member:", error)
    return NextResponse.json({ error: "Error al eliminar el concejal" }, { status: 500 })
  }
}