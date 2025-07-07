import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      console.error(`[API][DELETE /api/users/${params.id}] ID inválido`);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    console.log(`[API][DELETE /api/users/${userId}] Eliminando usuario...`);
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    if (deletedUser.length === 0) {
      console.warn(`[API][DELETE /api/users/${userId}] Usuario no encontrado`);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    console.log(`[API][DELETE /api/users/${userId}] Usuario eliminado`);
    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(`[API][DELETE /api/users/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      console.error(`[API][PUT /api/users/${params.id}] ID inválido`);
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const body = await request.json();
    const { name, email, role, password } = body;
    if (!name || !email || !role) {
      console.warn(`[API][PUT /api/users/${userId}] Faltan datos requeridos`);
      return NextResponse.json(
        { error: "Nombre, email y rol son requeridos" },
        { status: 400 }
      );
    }
    const updateData: any = { name, email, role };
    if (password) {
      // Aquí deberías hashear la contraseña antes de guardarla
      updateData.password = password;
    }
    console.log(`[API][PUT /api/users/${userId}] Actualizando usuario...`);
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    if (updatedUser.length === 0) {
      console.warn(`[API][PUT /api/users/${userId}] Usuario no encontrado`);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    console.log(`[API][PUT /api/users/${userId}] Usuario actualizado`);
    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error(`[API][PUT /api/users/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}