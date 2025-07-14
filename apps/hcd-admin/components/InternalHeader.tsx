"use client"

import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Actividades", href: "/actividades" },
  { label: "Sesiones", href: "/sesiones" },
  { label: "Comisiones", href: "/comisiones" },
  { label: "Bloques", href: "/bloques" },
  { label: "Legislación", href: "/legislacion" },
  { label: "Mesa de Entrada", href: "/mesa-entrada" },
]

export default function InternalHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN"
  const [open, setOpen] = useState(false)
  const userRef = useRef<HTMLLIElement>(null)

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <header className="w-full border-b bg-white">
      <div className="flex items-center py-3 gap-4" style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Image src="/logo_hcd.png" alt="Logo HCD" width={48} height={48} />
        <div>
          <h1 className="text-xl font-bold leading-tight">Concejo Deliberante</h1>
          <p className="text-xs text-gray-600">Las Flores</p>
        </div>
      </div>
      <nav className="bg-gray-100 border-t w-full">
        <div>
          <ul className="flex flex-wrap items-center py-2 gap-2" style={{ maxWidth: 1400, margin: '0 auto' }}>
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
            <li className="flex-1" />
            {session?.user && (
              <li className="relative pr-6" ref={userRef}>
                <button
                  className="flex items-center gap-2 focus:outline-none"
                  onClick={() => setOpen((v) => !v)}
                  title="Perfil de usuario"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-sm border">
                      {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{session.user.name}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50 p-5 min-w-[220px] flex flex-col items-center">
                    {session.user.image ? (
                      <img src={session.user.image} alt="avatar" className="w-14 h-14 rounded-full object-cover border mb-2" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-2xl border mb-2">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="text-center mb-3">
                      <div className="font-semibold text-gray-900">{session.user.name}</div>
                      <div className="text-xs text-gray-500">{session.user.email}</div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/admin-panel/login" })}
                      className="w-full px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-center mt-2"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}