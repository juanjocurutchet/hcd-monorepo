import { sql } from "@/lib/db-singleton";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[API][GET /api/users] Consultando usuarios directamente con SQL...");
    const result = await sql`SELECT * FROM users ORDER BY id ASC`;
    console.log("[DEBUG] SQL RESULT:", JSON.stringify(result, null, 2));

    return NextResponse.json(result, {
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
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500 });
  }
}
