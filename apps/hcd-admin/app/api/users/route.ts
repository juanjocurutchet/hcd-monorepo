import { db } from "@/lib/db-singleton";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[API][GET /api/users] Consultando usuarios RAW...");
    const raw = await db.execute("SELECT * FROM users");
    console.log("[DEBUG] RAW SQL:", JSON.stringify(raw, null, 2));
    return NextResponse.json(raw.rows, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[API][GET /api/users] Error:", error);
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}