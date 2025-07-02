import "./globals.css"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import ClientProviderWrapper from "@/components/providers/client-provider-wrapper"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Honorable Concejo Deliberante de Las Flores",
  description: "Sitio oficial del Honorable Concejo Deliberante de Las Flores",
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  const hideHeaderFooter = pathname.startsWith("/admin/login") || pathname.startsWith("/admin-panel")

  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientProviderWrapper>
          {!hideHeaderFooter && <Header />}
          <main className={!hideHeaderFooter ? "max-w-[1200px] mx-auto" : ""}>{children}</main>
          {!hideHeaderFooter && <Footer />}
        </ClientProviderWrapper>
      </body>
    </html>
  )
}
