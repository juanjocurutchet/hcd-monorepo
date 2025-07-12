"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ContactosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Contactos</h1>
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabLink href="/admin-panel-dashboard/contactos" active={pathname === "/admin-panel-dashboard/contactos"}>Contactos</TabLink>
          <TabLink href="/admin-panel-dashboard/contactos/grupos" active={pathname === "/admin-panel-dashboard/contactos/grupos"}>Grupos</TabLink>
        </nav>
      </div>
      <div>{children}</div>
    </div>
  )
}

function TabLink({ href, active, children }: { href: string, active: boolean, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        (active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        ) +
        " whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
      }
    >
      {children}
    </Link>
  )
}