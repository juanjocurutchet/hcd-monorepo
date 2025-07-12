import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // A. Drizzle: ORM SELECT
    const allUsersDrizzle = await db.select().from(users);
    console.log("[DEBUG][GET /api/users][Drizzle] Usuarios encontrados:", allUsersDrizzle);

    // B. RAW SQL: select directo
    const rawResult = await db.execute('SELECT * FROM users ORDER BY id');
    console.log("[DEBUG][GET /api/users][RAW SQL] Usuarios encontrados:", rawResult.rows);

    // Devuelve ambos para debug
    return NextResponse.json(
      {
        drizzle: allUsersDrizzle,
        raw: rawResult.rows,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("[API][GET /api/users] Error:", error);
    return NextResponse.json(
      { error: "Error interno al obtener usuarios" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
