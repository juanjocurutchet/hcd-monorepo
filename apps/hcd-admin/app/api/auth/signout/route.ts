import { authOptions } from "@/lib/auth-options"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (session) {
    return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/admin/login", process.env.NEXTAUTH_URL))
  }

  return NextResponse.redirect(new URL("/admin/login", process.env.NEXTAUTH_URL))
}