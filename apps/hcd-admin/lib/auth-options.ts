import { sql } from "@/lib/db-singleton"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
          const userResults = await sql`
            SELECT id, name, email, password, role
            FROM users
            WHERE email = ${credentials.email}
          ` as { id: number; name: string; email: string; password: string; role: string }[]
          if (userResults.length === 0) {
            return null
          }
          const user = userResults[0]
          if (!user) return null;
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }
          return {
            id: user.id?.toString() ?? "",
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role ?? "",
            jwt: "",
          }
        } catch (error) {
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
      if (user && typeof user === 'object' && 'role' in user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub ?? ""
        ;(session.user as any).role = token.role as string ?? ""
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}