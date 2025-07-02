export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Bienvenido al Panel de Administración</h2>
          <p className="text-gray-600">
            Desde aquí podrás gestionar todo el contenido del sitio web del Honorable Concejo Deliberante de Las Flores.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
          <ul className="space-y-2 text-[#0e4c7d]">
            <li>
              <a href="/admin-panel/noticias" className="hover:underline">
                Gestionar noticias
              </a>
            </li>
            <li>
              <a href="/admin-panel/documentos" className="hover:underline">
                Gestionar documentos
              </a>
            </li>
            <li>
              <a href="/admin-panel/sesiones" className="hover:underline">
                Gestionar sesiones
              </a>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ayuda</h2>
          <p className="text-gray-600">
            Si necesitas ayuda para utilizar el panel de administración, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
