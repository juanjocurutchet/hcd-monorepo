"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { usePathname } from "next/navigation"
import WeatherWidget from "./weather-widget"

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (menu: string) => {
    if (activeDropdown === menu) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(menu)
    }
  }

  return (
    <header className="w-full">
      {/* Barra superior */}
      <div className="bg-[#0e4c7d] text-white py-3">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative h-16 w-16 mr-4">
              <Image
                src="/logo_hcd.png"
                alt="Logo HCD Las Flores"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">Concejo Deliberante</h1>
              <p className="text-sm">Las Flores</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center">
            <div className="flex items-center mr-6 mb-3 md:mb-0">
              <WeatherWidget />
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <Link
                href="/sesiones/transmisiones"
                className="bg-blue-700 text-white px-3 py-1 rounded text-sm mb-2 md:mb-0 md:mr-4"
              >
                Sesión en vivo
              </Link>
              <div className="text-sm">
                Seguinos en
                <div className="flex space-x-2 mt-1">
                  <Link
                    href="https://www.youtube.com/channel/UCRVvtXaJETjQvbqUVvOkZAQ"
                    target="_blank"
                    className="hover:text-blue-300"
                  >
                    <Image src="/youtube-icon.png" alt="YouTube" width={24} height={24} />
                  </Link>
                  <Link href="https://www.facebook.com/hcdlasflores" target="_blank" className="hover:text-blue-300">
                    <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} />
                  </Link>
                  <Link href="https://twitter.com/hcdlasflores" target="_blank" className="hover:text-blue-300">
                    <Image src="/twitter-icon.png" alt="Twitter" width={24} height={24} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de información de contacto */}
      <div className="bg-[#0a3d68] text-white py-1 text-sm">
        <div className="max-w-[1200px] mx-auto">
          <p>Rivadavia 421, Las Flores | TE: 2244444452</p>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="bg-[#333] text-white relative" ref={dropdownRef}>
        <div className="max-w-[1200px] mx-auto">
          <ul className="flex flex-wrap">
            <li className="relative">
              <Link
                href="/"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Inicio
              </Link>
            </li>
            <li className="relative">
              <button
                className={`flex items-center px-4 py-3 hover:bg-[#444] ${
                  activeDropdown === "institucional" ? "bg-[#444]" : ""
                }`}
                onClick={() => toggleDropdown("institucional")}
              >
                Institucional <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "institucional" && (
                <div className="absolute z-10 bg-[#444] w-48">
                  <Link
                    href="/concejo/autoridades"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Autoridades
                  </Link>
                  <Link
                    href="/concejo/concejales"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Concejales
                  </Link>
                  <Link
                    href="/concejo/bloques"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Bloques políticos
                  </Link>
                  <Link
                    href="/concejo/comisiones"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Comisiones internas
                  </Link>
                  <Link
                    href="/concejo/concejales-anteriores"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Concejales anteriores
                  </Link>
                  <Link
                    href="/concejo/galeria"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Galería de fotos
                  </Link>
                  <Link
                    href="/concejo/audiencias"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Audiencias Públicas
                  </Link>
                  <Link
                    href="/concejo/arbolado"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Arbolado Público
                  </Link>
                </div>
              )}
            </li>
            <li className="relative">
              <button
                className={`flex items-center px-4 py-3 hover:bg-[#444] ${
                  activeDropdown === "sesiones" ? "bg-[#444]" : ""
                }`}
                onClick={() => toggleDropdown("sesiones")}
              >
                Sesiones <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "sesiones" && (
                <div className="absolute z-10 bg-[#444] w-48">
                  <Link
                    href="/sesiones"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Sesiones
                  </Link>
                  <Link
                    href="/sesiones/ordenes"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Órdenes del día
                  </Link>
                  <Link
                    href="/sesiones/actas"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Actas
                  </Link>
                  <Link
                    href="/sesiones/audios"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Audios
                  </Link>
                  <Link
                    href="/sesiones/transmisiones"
                    className="block px-4 py-2 hover:bg-[#555]"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Transmisiones en vivo
                  </Link>
                </div>
              )}
            </li>
            <li className="relative">
              <Link
                href="/banca-abierta"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/banca-abierta" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Banca Abierta
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/legislacion"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/legislacion" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Legislación
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/novedades"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/novedades" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Novedades
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/archivo-historico"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/archivo-historico" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Archivo Histórico
              </Link>
            </li>
            <li className="relative">
              <Link
                href="/contacto"
                className={`block px-4 py-3 hover:bg-[#444] ${pathname === "/contacto" ? "bg-[#444]" : ""}`}
                onClick={() => setActiveDropdown(null)}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
