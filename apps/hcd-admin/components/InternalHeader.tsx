"use client"

import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Actividades", href: "/actividades" },
  { label: "Sesiones", href: "/sesiones" },
  { label: "Comisiones", href: "/comisiones" },
  { label: "Bloques", href: "/bloques" },
  { label: "Concejales por bloque", href: "/concejales" },
  { label: "Legislación", href: "/legislacion" },
  { label: "Mesa de Entrada", href: "/mesa-entrada" },
]

export default function InternalHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN"

  return (
    <header className="w-full border-b bg-white">
      <div className="flex items-center px-6 py-3 gap-4">
        <Image src="/logo_hcd.png" alt="Logo HCD" width={48} height={48} />
        <div>
          <h1 className="text-xl font-bold leading-tight">Concejo Deliberante</h1>
          <p className="text-xs text-gray-600">Las Flores</p>
        </div>
      </div>
      <nav className="bg-gray-100 border-t">
        <ul className="flex flex-wrap items-center px-6 py-2 gap-2 w-full">
          {NAV_ITEMS.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`px-3 py-1 rounded hover:bg-blue-100 text-sm font-medium ${pathname === item.href ? "bg-blue-200 text-blue-900" : "text-gray-800"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link
                href="/admin-panel-dashboard"
                className="px-3 py-1 rounded bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800"
              >
                Panel de Administración
              </Link>
            </li>
          )}
          {/* Espaciador para empujar el usuario a la derecha */}
          <li className="flex-1" />
          {/* Usuario logueado */}
          {session?.user && (
            <li className="flex items-center gap-2">
              {/* Avatar */}
              {session.user.image ? (
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-sm border">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              {/* Nombre */}
              <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{session.user.name}</span>
              {/* Botón logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/admin-panel/login" })}
                className="ml-2 px-2 py-1 text-xs rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}