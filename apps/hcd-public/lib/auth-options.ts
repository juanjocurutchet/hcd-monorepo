import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db-singleton"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log("Intentando autenticar usuario:", credentials.email)

          // Buscar el usuario
          const userResults = await sql`
            SELECT id, name, email, password, role
            FROM users
            WHERE email = ${credentials.email}
          ` as { id: number; name: string; email: string; password: string; role: string }[]

          if (userResults.length === 0) {
            console.log("Usuario no encontrado")
            return null
          }

          const user = userResults[0]

          // Verificar la contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("Contraseña incorrecta")
            return null
          }

          console.log("Usuario autenticado exitosamente:", user.email)

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            jwt: "", // Provide a valid JWT or placeholder if not available
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
