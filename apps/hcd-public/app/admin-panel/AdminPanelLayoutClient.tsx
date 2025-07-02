"use client"

import {
  Activity,
  Calendar,
  FileText,
  Home,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { ReactNode } from "react"

export default function AdminPanelLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/admin/login" })
  }

  const navItems = [
    { name: "Dashboard", href: "/admin-panel/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Noticias", href: "/admin-panel/noticias", icon: <Newspaper className="h-5 w-5" /> },
    { name: "Documentos", href: "/admin-panel/documentos", icon: <FileText className="h-5 w-5" /> },
    { name: "Sesiones", href: "/admin-panel/sesiones", icon: <Calendar className="h-5 w-5" /> },
    { name: "Concejales", href: "/admin-panel/concejales", icon: <User className="h-5 w-5" /> },
    { name: "Personal", href: "/admin-panel/personal", icon: <Users className="h-5 w-5" /> },
    { name: "Bloques", href: "/admin-panel/bloques", icon: <Users className="h-5 w-5" /> },
    { name: "Comisiones", href: "/admin-panel/comisiones", icon: <Layers className="h-5 w-5" /> },
    { name: "Actividades", href: "/admin-panel/actividades", icon: <Activity className="h-5 w-5" /> },
    { name: "Mensajes", href: "/admin-panel/mensajes", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Usuarios", href: "/admin-panel/usuarios", icon: <UserPlus className="h-5 w-5" /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
            {isMobile && (
              <button onClick={toggleSidebar} className="md:hidden">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            )}
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center px-4 py-2 text-sm rounded-md ${
                      pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        ? "bg-[#0e4c7d] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            {isMobile && (
              <button onClick={toggleSidebar} className="md:hidden">
                <Menu className="h-6 w-6 text-gray-500" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-800">HCD Las Flores - Panel de Administración</h1>
            <div></div> {/* Placeholder para mantener el header centrado */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
