import Link from "next/link"
import ActivityStats from "./components/ActivityStats"
import UpcomingActivities from "./components/UpcomingActivities"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Panel de Administración - HCD Las Flores
        </div>
      </div>

      {/* Estadísticas de Actividades */}
      <ActivityStats />

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestión de Contenido */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Gestión de Contenido</h2>
          <div className="space-y-3">
            <Link href="/admin-panel/concejales" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-gray-700">Gestionar Concejales</span>
            </Link>
            <Link href="/admin-panel/documentos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-gray-700">Gestionar Disposiciones</span>
            </Link>
            <Link href="/admin-panel/sesiones" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">Gestionar Sesiones</span>
            </Link>
            <Link href="/admin-panel/comisiones" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gray-700">Gestionar Comisiones</span>
            </Link>
            <Link href="/admin-panel/actividades" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700">Gestionar Actividades</span>
            </Link>
          </div>
        </div>

        {/* Configuración del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Configuración</h2>
          <div className="space-y-3">
            <Link href="/admin-panel/usuarios" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span className="text-gray-700">Gestionar Usuarios</span>
            </Link>
            <Link href="/admin-panel/bloques" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-gray-700">Gestionar Bloques</span>
            </Link>
          </div>
        </div>

        {/* Próximas Actividades */}
        <UpcomingActivities />
      </div>

      {/* Mensaje de bienvenida */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">¡Bienvenido al Panel de Administración!</h3>
        <p className="text-blue-800">
          Desde aquí podrás gestionar todo el contenido del sitio web del Honorable Concejo Deliberante de Las Flores.
          Utiliza las herramientas disponibles para mantener actualizada la información pública.
        </p>
      </div>
    </div>
  )
}
