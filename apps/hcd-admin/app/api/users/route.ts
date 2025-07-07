import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[API][GET /api/users] Consultando usuarios...");
    if (!process.env.DATABASE_URL) {
      console.error("[API][GET /api/users] DATABASE_URL no está definida");
      return NextResponse.json({ error: "DATABASE_URL no está definida" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
    const allUsers = await db.select().from(users);
    console.log(`[API][GET /api/users] Usuarios encontrados: ${allUsers.length}`);
    return NextResponse.json(allUsers, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[API][GET /api/users] Error:", error);
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}