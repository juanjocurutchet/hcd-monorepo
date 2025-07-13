import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[API][GET /api/users] Consultando usuarios con Drizzle...");

    // Consulta con Drizzle
    const allUsers = await db.select().from(users).orderBy(users.id);
    console.log(`[API][GET /api/users] Usuarios encontrados con Drizzle: ${allUsers.length}`);

    // Consulta RAW para comparar
    const rawResult = await db.execute("SELECT COUNT(*) as count FROM users");
    const rawCount = (rawResult as any).rows[0]?.count;
    console.log(`[API][GET /api/users] Count RAW SQL: ${rawCount}`);

    if (allUsers.length !== parseInt(rawCount)) {
      console.warn(`[API][GET /api/users] DISCREPANCIA: Drizzle=${allUsers.length}, RAW=${rawCount}`);
    }

    return NextResponse.json(allUsers, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[API][GET /api/users] Error:", error);
    return NextResponse.json({ error: "Error interno al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API][POST /api/users] Creando nuevo usuario...");
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validaciones
    if (!name || !email || !password) {
      console.warn("[API][POST /api/users] Faltan datos requeridos");
      return NextResponse.json(
        { error: "Nombre, email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.warn("[API][POST /api/users] Email ya existe:", email);
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const result = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role || "editor",
      })
      .returning();

    const newUser = result[0];
    if (!newUser) {
      throw new Error("No se pudo crear el usuario");
    }

    console.log("[API][POST /api/users] Usuario creado exitosamente:", newUser.id);

    // Retornar el usuario sin la contraseña
    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API][POST /api/users] Error:", error);
    return NextResponse.json(
      { error: "Error interno al crear usuario" },
      { status: 500 }
    );
  }
}