import { db } from "@/lib/db-singleton";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("DB URL (GET):", process.env.DATABASE_URL);
  const allUsers = await db.select().from(users);
  console.log("USUARIOS ENCONTRADOS:", allUsers);
  return NextResponse.json(allUsers);
}