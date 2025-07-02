import { createSession, getSessions } from "@/lib/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyPublished = searchParams.get("onlyPublished") !== "false";
    // Puedes agregar más filtros si lo necesitas
    const sesiones = await getSessions({ onlyPublished });
    return NextResponse.json(sesiones);
  } catch (error) {
    console.error("Error en GET /api/sessions:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const dateStr = formData.get("date") as string;
    const type = formData.get("type") as string;
    const videoUrl = formData.get("videoUrl") as string | null;
    const isPublished = formData.get("isPublished") === "true";
    if (!dateStr || !type) {
      return NextResponse.json({ error: "Fecha y tipo son requeridos" }, { status: 400 });
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const agendaFile = formData.get("agendaFile") as File | null;
    const minutesFile = formData.get("minutesFile") as File | null;
    const audioFile = formData.get("audioFile") as File | null;
    const result = await createSession({
      date,
      type,
      agendaFile: (agendaFile && agendaFile.size > 0) ? agendaFile : null,
      minutesFile: (minutesFile && minutesFile.size > 0) ? minutesFile : null,
      audioFile: (audioFile && audioFile.size > 0) ? audioFile : null,
      videoUrl: videoUrl || undefined,
      isPublished,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error en POST /api/sessions:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}