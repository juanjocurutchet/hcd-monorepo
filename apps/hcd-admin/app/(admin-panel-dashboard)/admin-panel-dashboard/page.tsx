"use client";

import Link from "next/link";
import ActivityStats from "./components/ActivityStats";
import UpcomingActivities from "./components/UpcomingActivities";

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
            <Link href="/admin-panel-dashboard/concejales" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-blue-600 mr-3">👤</span>
              <span className="text-gray-700">Gestionar Concejales</span>
            </Link>
            <Link href="/admin-panel-dashboard/documentos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-green-600 mr-3">📄</span>
              <span className="text-gray-700">Gestionar Disposiciones</span>
            </Link>
            <Link href="/admin-panel-dashboard/sesiones" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-purple-600 mr-3">📅</span>
              <span className="text-gray-700">Gestionar Sesiones</span>
            </Link>
            <Link href="/admin-panel-dashboard/comisiones" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-indigo-600 mr-3">🗂️</span>
              <span className="text-gray-700">Gestionar Comisiones</span>
            </Link>
            <Link href="/admin-panel-dashboard/actividades" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-orange-600 mr-3">📊</span>
              <span className="text-gray-700">Gestionar Actividades</span>
            </Link>
          </div>
        </div>

        {/* Configuración del Sistema */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Configuración</h2>
          <div className="space-y-3">
            <Link href="/admin-panel-dashboard/usuarios" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-red-600 mr-3">👥</span>
              <span className="text-gray-700">Gestionar Usuarios</span>
            </Link>
            <Link href="/admin-panel-dashboard/bloques" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-yellow-600 mr-3">🏛️</span>
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
  );
}