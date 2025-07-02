import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    jwt: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      jwt: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    jwt: string
  }
}
