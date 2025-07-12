import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[DEBUG] Consultando usuarios directamente...");

    // Consulta directa sin filtros
    const allUsers = await db.select().from(users);

    // Consulta con SQL raw para verificar
    const rawQuery = await db.execute("SELECT COUNT(*) as count FROM users");
    const count = rawQuery[0]?.count;

    console.log(`[DEBUG] Usuarios encontrados: ${allUsers.length}`);
    console.log(`[DEBUG] Count SQL raw: ${count}`);
    console.log("[DEBUG] Usuarios:", JSON.stringify(allUsers, null, 2));

    return NextResponse.json({
      drizzleCount: allUsers.length,
      rawCount: count,
      users: allUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[DEBUG] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}