import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicRoute = [
    "/",
    "/admin-panel/login",
    "/admin/unauthorized",
    "/favicon.ico",
  ].some(route => path.startsWith(route)) ||
    path.startsWith("/_next") ||
    path.startsWith("/api/auth")

  const response = NextResponse.next()
  response.headers.set("x-pathname", path) // <- línea clave para que el layout pueda leer el path

  if (isPublicRoute) return response

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isProtectedRoute = path.startsWith("/admin-panel")

  if (isProtectedRoute) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", token.id as string)
    requestHeaders.set("x-user-role", token.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
      headers: response.headers,
    })
  }

  return response
}
