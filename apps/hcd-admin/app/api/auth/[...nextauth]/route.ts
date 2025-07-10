import { loginUser } from "@/lib/auth"
import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// authOptions solo se usa internamente, no se exporta
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await loginUser(credentials.email, credentials.password)

        if (!result?.user) return null

        const { id, name, email, role } = result.user
        return { id, name, email, role } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string ?? ""
        ;(session.user as any).role = token.role as string ?? ""
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Siempre redirigir a la home interna tras login
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/admin-panel/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
