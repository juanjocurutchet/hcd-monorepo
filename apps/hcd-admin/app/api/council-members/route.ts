import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("blockId");

    const baseQuery = db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        position: councilMembers.position,
        seniorPosition: councilMembers.seniorPosition,
        blockId: councilMembers.blockId,
        mandate: councilMembers.mandate,
        imageUrl: councilMembers.imageUrl,
        bio: councilMembers.bio,
        isActive: councilMembers.isActive,
        blockName: politicalBlocks.name,
        blockColor: politicalBlocks.color,
      })
      .from(councilMembers);

    const filteredQuery = blockId
      ? baseQuery.where(eq(councilMembers.blockId, Number(blockId)))
      : baseQuery;

    const result = await filteredQuery.leftJoin(
      politicalBlocks,
      eq(councilMembers.blockId, politicalBlocks.id)
    );
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error fetching council members:", error);
    return NextResponse.json({ error: "Error al obtener los concejales" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    let insertData: any = {}
    const contentType = request.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (key === "image" && typeof value === "object" && "arrayBuffer" in value && value.size > 0) {
          // Subida real a Cloudinary
          const imageUrl = await uploadFile(value, "council-members")
          insertData.imageUrl = imageUrl
        } else if (key === "isActive") {
          insertData.isActive = value === "true"
        } else if (key === "blockId") {
          insertData.blockId = value === "-1" ? null : Number(value)
        } else {
          insertData[key] = value
        }
      }
    } else {
      insertData = await request.json()
    }
    const [newMember] = await db.insert(councilMembers).values(insertData).returning()
    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Error creating council member:", error)
    return NextResponse.json({ error: "Error al crear el concejal" }, { status: 500 })
  }
}